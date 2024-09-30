import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OptionListComponent } from './option-list.component';

describe('OptionListComponent', () => {
  let component: OptionListComponent;
  let fixture: ComponentFixture<OptionListComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [OptionListComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OptionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
