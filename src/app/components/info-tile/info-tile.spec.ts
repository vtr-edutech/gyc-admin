import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoTile } from './info-tile';

describe('InfoTile', () => {
  let component: InfoTile;
  let fixture: ComponentFixture<InfoTile>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoTile]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoTile);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
