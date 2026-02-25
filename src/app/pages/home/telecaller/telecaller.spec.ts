import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Telecaller } from './telecaller';

describe('Telecaller', () => {
  let component: Telecaller;
  let fixture: ComponentFixture<Telecaller>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Telecaller]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Telecaller);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
