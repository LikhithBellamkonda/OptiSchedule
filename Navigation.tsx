import { StudentEnrollment, RoomData, ScheduledExam, SchedulerConfig, Teacher, AlgorithmLog, GraphData } from '../types';

export function runScheduling(
  enrollments: StudentEnrollment[],
  rooms: RoomData[],
  teachers: Teacher[],
  config: SchedulerConfig
): { schedule: ScheduledExam[]; conflicts: string[]; logs: AlgorithmLog[]; graphData: GraphData } {
  const logs: AlgorithmLog[] = [];
  let step = 1;
  const log = (action: string, node: string | null = null, colorAssigned: number | null = null, details: string = "") => {
    logs.push({ step: step++, action, node, colorAssigned, details });
  };

  log("Initialization", null, null, "Building conflict graph...");

  // 1. Compute Subject Statistics and Conflict Graph
  const graph: Map<string, Set<string>> = new Map();
  const subjectStudentCounts: Map<string, number> = new Map();

  const subjectsPerStudent: Map<string, string[]> = new Map();

  for (const enrollment of enrollments) {
    if (!enrollment.subjects || enrollment.subjects.length === 0) continue;
    const subjects = enrollment.subjects.map(s => s.trim());
    subjectsPerStudent.set(enrollment.studentId, subjects);

    for (let i = 0; i < subjects.length; i++) {
      const s1 = subjects[i];
      subjectStudentCounts.set(s1, (subjectStudentCounts.get(s1) || 0) + 1);
      if (!graph.has(s1)) graph.set(s1, new Set());

      for (let j = i + 1; j < subjects.length; j++) {
        const s2 = subjects[j];
        if (!graph.has(s2)) graph.set(s2, new Set());
        
        graph.get(s1)!.add(s2);
        graph.get(s2)!.add(s1);
      }
    }
  }

  const subjectsList = Array.from(subjectStudentCounts.keys());
  log("Graph Build Complete", null, null, `Found ${subjectsList.length} subjects with valid enrollments.`);
  
  // DSATUR Algorithm to assign colors (slots)
  const colors: Map<string, number> = new Map(); // subject -> slot ID (0-indexed)
  const saturationDegree: Map<string, Set<number>> = new Map(); // subject -> distinct colors of neighbors
  const degree: Map<string, number> = new Map(); // subject -> number of uncolored neighbors

  // Initialize
  for (const sub of subjectsList) {
    saturationDegree.set(sub, new Set());
    degree.set(sub, graph.get(sub)!.size);
  }

  const uncolored = new Set(subjectsList);

  const getDayForSlot = (slotIdx: number) => Math.floor(slotIdx / config.slotsPerDay) + 1;
  const getRelativeSlot = (slotIdx: number) => (slotIdx % config.slotsPerDay) + 1;

  log("Algorithm Start", null, null, "Starting DSATUR node coloring logic.");

  while (uncolored.size > 0) {
    // a. Select node with max saturation degree, tie-breaker max degree
    let selectedNode: string | null = null;
    let maxSat = -1;
    let maxDeg = -1;

    for (const node of uncolored) {
      const sat = saturationDegree.get(node)!.size;
      const deg = degree.get(node)!;
      if (sat > maxSat || (sat === maxSat && deg > maxDeg)) {
        selectedNode = node;
        maxSat = sat;
        maxDeg = deg;
      }
    }

    if (!selectedNode) break; // Should not happen
    
    // b. Find smallest available color
    const neighborsColors = new Set<number>();
    if (graph.has(selectedNode)) {
      for (const neighbor of graph.get(selectedNode)!) {
        if (colors.has(neighbor)) {
          neighborsColors.add(colors.get(neighbor)!);
        }
      }
    }

    let assignedColor = -1;
    const maxColors = config.days * config.slotsPerDay;
    for (let c = 0; c < maxColors; c++) {
      if (neighborsColors.has(c)) continue;
      
      const candidateDay = getDayForSlot(c);
      const candidateRelativeSlot = getRelativeSlot(c);
      const slotKey = `${candidateDay}-${candidateRelativeSlot}`;
      
      // Also respect max exams per student per day constraint
      // Check if any student taking this subject already has too many exams on this day
      let dayViolation = false;
      for (const [studentId, studentSubjects] of subjectsPerStudent.entries()) {
        if (studentSubjects.includes(selectedNode)) {
          // Count exams on candidateDay
          let countOnDay = 0;
          for (const s of studentSubjects) {
            if (colors.has(s)) {
              if (getDayForSlot(colors.get(s)!) === candidateDay) {
                countOnDay++;
              }
            }
          }
          if (countOnDay >= config.maxExamsPerStudentPerDay) {
            dayViolation = true;
            break;
          }
        }
      }

      if (dayViolation) continue;

      // Check if any teacher is feasible for this candidate color
      const eligibleTeachers = teachers.filter(t => t.subjects.includes(selectedNode!));
      if (eligibleTeachers.length > 0) {
        let anyFeasible = false;
        for (const teacher of eligibleTeachers) {
          if (teacher.feasibleSlots.length === 0 || teacher.feasibleSlots.includes(slotKey)) {
             anyFeasible = true;
             break;
          }
        }
        if (!anyFeasible) continue;
      }

      assignedColor = c;
      break;
    }

    if (assignedColor === -1) {
      // Failed to color within max colors or constraints.
      assignedColor = 0;
      while (neighborsColors.has(assignedColor)) {
        assignedColor++;
      }
      log("Constraint Violation", selectedNode, assignedColor, "Could not find color without breaking constraints.");
    } else {
      log("Color Assigned", selectedNode, assignedColor, `Saturation: ${maxSat}, Degree: ${maxDeg}`);
    }

    colors.set(selectedNode, assignedColor);
    uncolored.delete(selectedNode);

    // c. Update neighbors
    for (const neighbor of graph.get(selectedNode) || []) {
      if (uncolored.has(neighbor)) {
        saturationDegree.get(neighbor)!.add(assignedColor);
        degree.set(neighbor, degree.get(neighbor)! - 1);
      }
    }
  }

  log("Algorithm Complete", null, null, "All subjects colored successfully.");

  // Final validation to catch any unresolvable conflicts
  const conflicts: string[] = [];
  for (const [sub, color] of colors.entries()) {
    if (color >= config.days * config.slotsPerDay) {
      conflicts.push(`Subject ${sub} could not fit in the configured timetable without conflicts.`);
    }
  }

  log("Allocation Phase", null, null, "Starting room and teacher allocation.");

  // Room Allocation
  const schedule: ScheduledExam[] = [];
  const roomsByCapacityAsc = [...rooms].sort((a, b) => a.capacity - b.capacity);
  
  // Group by slot
  const slotToSubjects: Map<number, string[]> = new Map();
  for (const [sub, slot] of colors.entries()) {
    if (!slotToSubjects.has(slot)) slotToSubjects.set(slot, []);
    slotToSubjects.get(slot)!.push(sub);
  }

  for (const [slot, subjectsInSlot] of slotToSubjects.entries()) {
    const day = getDayForSlot(slot);
    const relativeSlot = getRelativeSlot(slot); 
    const slotKey = `${day}-${relativeSlot}`;
    
    // Sort subjects by student count descending to allocate largest classes first
    subjectsInSlot.sort((a, b) => subjectStudentCounts.get(b)! - subjectStudentCounts.get(a)!);

    const availableRooms = new Set(roomsByCapacityAsc.map(r => r.id));
    const busyTeachers = new Set<string>();
    
    for (const sub of subjectsInSlot) {
      const stuCount = subjectStudentCounts.get(sub)!;
      let assignedRoom: RoomData | null = null;
      let assignedTeacher: Teacher | null = null;

      // Assign Room
      for (const room of roomsByCapacityAsc) {
        if (availableRooms.has(room.id) && room.capacity >= stuCount) {
          assignedRoom = room;
          availableRooms.delete(room.id);
          break;
        }
      }

      // Assign Teacher
      const eligibleTeachers = teachers.filter(t => t.subjects.includes(sub));
      for (const t of eligibleTeachers) {
         if (!busyTeachers.has(t.id) && (t.feasibleSlots.length === 0 || t.feasibleSlots.includes(slotKey))) {
            assignedTeacher = t;
            busyTeachers.add(t.id);
            break;
         }
      }

      if (!assignedRoom) {
        conflicts.push(`Could not find a large enough/available room for ${sub} (${stuCount} students) on Day ${day}, Slot ${relativeSlot}.`);
      }
      if (rooms.length > 0 && !assignedTeacher && eligibleTeachers.length > 0) {
        conflicts.push(`No available teacher for ${sub} on Day ${day}, Slot ${relativeSlot}.`);
      }

      schedule.push({
        subject: sub,
        day,
        slot: relativeSlot,
        room: assignedRoom,
        teacher: assignedTeacher,
        studentCount: stuCount
      });
    }
  }

  log("Complete", null, null, "Timetable generation finished.");

  const graphData = {
    nodes: subjectsList.map(s => ({
      id: s,
      colorAssigned: colors.has(s) ? colors.get(s)! : null
    })),
    edges: Array.from(graph.entries()).flatMap(([source, targets]) => 
      Array.from(targets).map(target => ({ source, target }))
    ).filter((edge, index, self) => 
      index === self.findIndex(e => (e.source === edge.source && e.target === edge.target) || (e.source === edge.target && e.target === edge.source))
    )
  };

  return { schedule: schedule.sort((a, b) => (a.day === b.day ? a.slot - b.slot : a.day - b.day)), conflicts, logs, graphData };
}

export function calculateQualityMetrics(schedule: ScheduledExam[], rooms: RoomData[]) {
  if (schedule.length === 0) return { qualityScore: 0, utilization: 0, totalExams: 0 };
  
  let validUtilizationsSum = 0;
  let allocatedCount = 0;

  schedule.forEach(ex => {
    if (ex.room) {
      validUtilizationsSum += (ex.studentCount / ex.room.capacity);
      allocatedCount++;
    }
  });

  const avgUtil = allocatedCount > 0 ? (validUtilizationsSum / allocatedCount) * 100 : 0;
  
  // Simplified quality score based mainly on utilization (closer to 80% is ideal)
  let utilScore = 100;
  if (avgUtil < 70) utilScore = avgUtil * (100/70);
  else if (avgUtil > 90) utilScore = 100 - (avgUtil - 90)*2;

  // Penalty for exams without rooms
  const unroomedPenalty = ((schedule.length - allocatedCount) / schedule.length) * 100;
  const qualityScore = Math.max(0, utilScore - unroomedPenalty);

  return {
    qualityScore: Math.round(qualityScore),
    utilization: Math.round(avgUtil),
    totalExams: schedule.length
  };
}
