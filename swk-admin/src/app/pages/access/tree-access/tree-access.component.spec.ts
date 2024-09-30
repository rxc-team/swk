import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeAccessComponent } from './tree-access.component';

describe('TreeAccessComponent', () => {
  let component: TreeAccessComponent;
  let fixture: ComponentFixture<TreeAccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TreeAccessComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TreeAccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
