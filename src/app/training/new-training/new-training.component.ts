import { Component, OnInit, OnDestroy } from '@angular/core';
import { TrainingService } from '../training.service';
import { Exercise } from '../exercise.model';
import { NgForm } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit, OnDestroy {
  excercises: Exercise[];
  excerciseSubscription: Subscription;

  constructor(private trainingService: TrainingService) { }

  ngOnInit() {
    this.trainingService.fetchAvailableExcercises();
    this.excerciseSubscription = this.trainingService.exercisesChanged.subscribe((exercises: Exercise[]) => this.excercises = exercises);
  }

  ngOnDestroy(): void {
    this.excerciseSubscription.unsubscribe();
  }

  onStartTraining(form: NgForm) {
    this.trainingService.startExcercise(form.value.excercise);
  }

}
