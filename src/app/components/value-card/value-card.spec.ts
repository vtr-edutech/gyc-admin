import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValueCard } from './value-card';

describe('ValueCard', () => {
  let component: ValueCard;
  let fixture: ComponentFixture<ValueCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValueCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValueCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
