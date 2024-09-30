import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OptionAddComponent } from './option-add.component';

describe('OptionAddComponent', () => {
  let component: OptionAddComponent;
  let fixture: ComponentFixture<OptionAddComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OptionAddComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
