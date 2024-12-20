import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JuegoNoDisponibleComponent } from './juego-no-disponible.component';

describe('JuegoNoDisponibleComponent', () => {
  let component: JuegoNoDisponibleComponent;
  let fixture: ComponentFixture<JuegoNoDisponibleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JuegoNoDisponibleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(JuegoNoDisponibleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
