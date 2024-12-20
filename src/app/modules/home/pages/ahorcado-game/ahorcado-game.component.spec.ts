import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AhorcadoGameComponent } from './ahorcado-game.component';

describe('AhorcadoGameComponent', () => {
  let component: AhorcadoGameComponent;
  let fixture: ComponentFixture<AhorcadoGameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AhorcadoGameComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AhorcadoGameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
