import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuncEditorComponent } from './func-editor.component';

describe('FuncEditorComponent', () => {
  let component: FuncEditorComponent;
  let fixture: ComponentFixture<FuncEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FuncEditorComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FuncEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
