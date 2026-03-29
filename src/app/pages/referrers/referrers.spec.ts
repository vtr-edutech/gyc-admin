import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Referrers } from './referrers';

describe('Referrers', () => {
  let component: Referrers;
  let fixture: ComponentFixture<Referrers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Referrers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Referrers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
