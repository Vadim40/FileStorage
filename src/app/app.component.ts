import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ContractInteractionComponent } from './components/contract-interaction/contract-interaction.component';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ContractInteractionComponent, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'sepolia-app';
}
