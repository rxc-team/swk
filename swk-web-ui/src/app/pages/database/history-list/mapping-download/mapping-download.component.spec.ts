import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MappingDownloadComponent } from './mapping-download.component';

describe('MappingDownloadComponent', () => {
  let component: MappingDownloadComponent;
  let fixture: ComponentFixture<MappingDownloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MappingDownloadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
