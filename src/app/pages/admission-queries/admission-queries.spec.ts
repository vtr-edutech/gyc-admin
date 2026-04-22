import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdmissionQueries } from './admission-queries';

describe('AdmissionQueries', () => {
  let component: AdmissionQueries;
  let fixture: ComponentFixture<AdmissionQueries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdmissionQueries]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdmissionQueries);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
