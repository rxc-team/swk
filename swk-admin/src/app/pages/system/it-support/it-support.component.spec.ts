import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ItSupportComponent } from './it-support.component';

describe('ItSupportComponent', () => {
  let component: ItSupportComponent;
  let fixture: ComponentFixture<ItSupportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ItSupportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ItSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
