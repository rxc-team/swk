import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuncGenComponent } from './func-gen.component';

describe('FuncGenComponent', () => {
  let component: FuncGenComponent;
  let fixture: ComponentFixture<FuncGenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FuncGenComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FuncGenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
