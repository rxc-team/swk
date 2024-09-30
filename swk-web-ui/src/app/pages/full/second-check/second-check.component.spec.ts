import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SecondCheckComponent } from './second-check.component';

describe('SecondCheckComponent', () => {
  let component: SecondCheckComponent;
  let fixture: ComponentFixture<SecondCheckComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SecondCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SecondCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
