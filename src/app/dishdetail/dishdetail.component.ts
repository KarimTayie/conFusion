import { Component, OnInit, ViewChild, Inject } from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, Validators, FormBuilder, NgForm } from '@angular/forms';
import { switchMap } from 'rxjs/operators';

import { Dish } from '../shared/dish';
import { Comment } from '../shared/comment';

import { DishService } from '../services/dish.service';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {

  @ViewChild('cform') commentFormDirective: NgForm;
  dish: Dish;
  dishIds: string[];
  prev: string;
  next: string;
  comment: Comment;
  commentForm: FormGroup;
  errMess: string;
  dishCopy: Dish;

  formErrors = {
    'author': '',
    'comment': ''
  };

  validationMessages = {
    'author': {
      'required': 'Author Name is required.',
      'minlength': 'Author Name must be at least 2 characters long.'
    },
    'comment': {
      'required': 'Comment is required.'
    }
  };

  constructor(private dishService: DishService,
              private route: ActivatedRoute,
              private location: Location,
              private fb: FormBuilder,
              @Inject('BaseURL') public baseURL: string) { }

  ngOnInit() {
    this.createForm();

    this.dishService.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params.pipe(
      switchMap((params: Params) => this.dishService.getDish(+params['id'])))
      .subscribe(
        dish => {
          this.dish = dish;
          this.dishCopy = dish;
          this.setPrevNext(dish.id);
          console.log(this.dish);
        },
        errMess => this.errMess = <any>errMess);

  }

  setPrevNext(dishId) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }

  goBack(): void {
    this.location.back();
  }

  createForm() {
    this.commentForm = this.fb.group({
      author: ['', [
        Validators.required,
        Validators.minLength(2)
      ]],
      rating: 5,
      comment: ['', Validators.required]
    });

    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged();
  }

  onSubmit() {
    this.comment = this.commentForm.value;
    this.comment.date = new Date().toISOString();

    this.dishCopy.comments.push(this.comment);
    this.dishService.putDish(this.dishCopy)
      .subscribe(
        dish => {
          this.dish = dish;
          this.dishCopy = dish;
        },
        errmes => {
          this.dish = null;
          this.dishCopy = null;
          this.errMess = <any>errmes;
        });
    this.commentFormDirective.resetForm();
    this.commentForm.reset({
      rating: 5,
      comment: ''
    });
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }
}
