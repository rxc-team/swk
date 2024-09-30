import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { QuestionAddComponent } from './question-add.component';

describe('QuestionAddComponent', () => {
  let component: QuestionAddComponent;
  let fixture: ComponentFixture<QuestionAddComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [QuestionAddComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
