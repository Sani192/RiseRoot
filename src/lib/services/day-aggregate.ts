import { noteRepository, taskRepository, weightRepository, workoutRepository } from "@/repositories";

export async function getDayAggregate(input: { userId: string; date: string; timezone: string }) {
  const [tasks, workouts, note, logs] = await Promise.all([
    taskRepository.listByDate(input.userId, input.date),
    workoutRepository.listUpcoming(input.userId),
    noteRepository.findByDate(input.userId, input.date),
    weightRepository.listByDate(input.userId, input.date),
  ]);

  return {
    date: input.date,
    timezone: input.timezone,
    tasks: tasks.map((task) => ({ id: task.id, title: task.title, status: task.status, completed: task.status === "completed" })),
    workouts: workouts.map((w) => ({ id: w.id, title: w.name, status: w.status, complete: w.status === "completed" })),
    note: note ? { body: note.body, updatedAt: note.updatedAt } : null,
    logs: logs.map((row) => ({
      id: row.id,
      userId: row.userId,
      loggedOn: row.loggedOn,
      weightValue: row.weightValue,
      weightUnit: row.weightUnit,
      source: row.source,
    })),
  };
}
