import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DocumentAddComponent } from './document-add.component';

describe('DocumentAddComponent', () => {
  let component: DocumentAddComponent;
  let fixture: ComponentFixture<DocumentAddComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
