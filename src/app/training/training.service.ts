import { Exercise } from './exercise.model';
import { Subject } from 'rxjs';
import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';


@Injectable()
export class TrainingService {
  constructor(private db: AngularFirestore) { }

  exerciseChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();
  finishedExercisesChanged = new Subject<Exercise[]>();

  private availableExcercises: Exercise[] = [];
  private runningExcercise: Exercise;

  fetchAvailableExcercises() {
    this.db
      .collection('availableExercises')
      .snapshotChanges()
      .pipe(
        map(docArray => docArray.map(doc => ({
          id: doc.payload.doc.id,
          name: doc.payload.doc.data()['name'],
          duration: doc.payload.doc.data()['duration'],
          calories: doc.payload.doc.data()['calories'],
        })))
      )
      .subscribe((exercises: Exercise[]) => {
        this.availableExcercises = exercises;
        this.exercisesChanged.next([...exercises]);
      });
  }

  getRunninExcercise() {
    return { ...this.runningExcercise };
  }

  startExcercise(selectedId: string) {
    this.runningExcercise = this.availableExcercises.find(exc => exc.id === selectedId);
    this.exerciseChanged.next({ ...this.runningExcercise });
  }

  completeExcercise() {
    this.addDataToDatabase({ ...this.runningExcercise, date: new Date(), state: 'completed' });
    this.runningExcercise = null;
    this.exerciseChanged.next(null);
  }
  cancelExcercise(progress: number) {
    this.addDataToDatabase({
      ...this.runningExcercise,
      date: new Date(),
      state: 'cancelled',
      duration: this.runningExcercise.duration * (progress / 100),
      calories: this.runningExcercise.calories * (progress / 100),
    });
    this.runningExcercise = null;
    this.exerciseChanged.next(null);
  }

  fetchCompletedOrCancelledExercises() {
    this.db.collection('finishedExercises')
      .valueChanges()
      .subscribe((exercises: Exercise[]) => {
        this.finishedExercisesChanged.next([...exercises]);
      });
  }

  addDataToDatabase(exercise: Exercise) {
    this.db.collection('finishedExercises').add(exercise);
  }
}
