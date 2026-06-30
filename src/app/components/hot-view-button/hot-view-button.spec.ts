import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotViewButton } from './hot-view-button';

describe('HotViewButton', () => {
  let component: HotViewButton;
  let fixture: ComponentFixture<HotViewButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotViewButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotViewButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
