import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FruitCatcherComponent } from './fruit-catcher.component';

describe('FruitCatcherComponent', () => {
  let component: FruitCatcherComponent;
  let fixture: ComponentFixture<FruitCatcherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FruitCatcherComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FruitCatcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
