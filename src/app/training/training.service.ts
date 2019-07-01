import { Exercise } from './exercise.model';
import { Subject } from 'rxjs';

export class TrainingService {
  excerciseChanged = new Subject<Exercise>();

  private availableExcercises: Exercise[] = [
    { id: 'crunches', name: 'Crunches', duration: 30, calories: 8 },
    { id: 'touch-toes', name: 'Touch Toes', duration: 180, calories: 15 },
    { id: 'side-lunges', name: 'Side Lunges', duration: 120, calories: 18 },
    { id: 'burpees', name: 'Burpees', duration: 60, calories: 8 }
  ];
  private runningExcercise: Exercise;
  private exercises: Exercise[] = [];


  getAvailableExcercises() {
    return this.availableExcercises.slice();
  }

  getRunninExcercise() {
    return { ...this.runningExcercise };
  }

  startExcercise(selectedId: string) {
    this.runningExcercise = this.availableExcercises.find(exc => exc.id === selectedId);
    this.excerciseChanged.next({ ...this.runningExcercise });
  }

  completeExcercise() {
    this.exercises.push({ ...this.runningExcercise, date: new Date(), state: 'completed' });
    this.runningExcercise = null;
    this.excerciseChanged.next(null);
  }
  cancelExcercise(progress: number) {
    this.exercises.push({
      ...this.runningExcercise,
      date: new Date(),
      state: 'cancelled',
      duration: this.runningExcercise.duration * (progress / 100),
      calories: this.runningExcercise.calories * (progress / 100),
    });
    this.runningExcercise = null;
    this.excerciseChanged.next(null);
  }

  getCompletedOrCancelledExercises() {
    return this.exercises.slice();
  }
}
