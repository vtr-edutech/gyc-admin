import { Component } from '@angular/core';
import { Button } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { InputText } from 'primeng/inputtext';

@Component({
  selector: 'app-sign-in',
  imports: [CardModule, FloatLabel, InputText, Button],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.css',
})
export class SignIn {}
