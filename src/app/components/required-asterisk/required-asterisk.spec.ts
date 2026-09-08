import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequiredAsterisk } from './required-asterisk';

describe('RequiredAsterisk', () => {
  let component: RequiredAsterisk;
  let fixture: ComponentFixture<RequiredAsterisk>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequiredAsterisk]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequiredAsterisk);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
