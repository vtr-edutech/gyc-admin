import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Telecallers } from './telecallers';

describe('Telecallers', () => {
  let component: Telecallers;
  let fixture: ComponentFixture<Telecallers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Telecallers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Telecallers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
