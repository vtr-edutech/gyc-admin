import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferrerDetails } from './referrer-details';

describe('ReferrerDetails', () => {
  let component: ReferrerDetails;
  let fixture: ComponentFixture<ReferrerDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferrerDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReferrerDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
