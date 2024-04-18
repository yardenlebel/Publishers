import {Component, OnInit} from '@angular/core';
import {PublisherCardComponent} from "./publisher-card/publisher-card.component";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import { Observable } from 'rxjs';

export type Publisher = {
  publisher: string;
  domains: Array<Domain>
};

export type Domain = {
  domain: string,
  desktopAds: number,
  mobileAds: number
};

@Component({
  selector: 'app-publishers-container',
  standalone: true,
  imports: [
    PublisherCardComponent,
    CommonModule,
    FormsModule 
  ],
  templateUrl: './publishers-container.component.html',
  styleUrl: './publishers-container.component.css'
})
export class PublishersContainerComponent implements OnInit {
  constructor() {
  }
  data: any;

  loadData(): void {
    console.log('in')
    fetch('http://localhost:3000/getData')
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        this.data = data;
      })
      .catch((err) => {
        console.error('Error loading data:', err);
      });
  }

  ngOnInit(): void {
    this.loadData();
  }
  
  showPublisherInput: boolean = false;
  showDomainInputs: boolean = false;
  newDomain: Domain = { domain: '', desktopAds: 0, mobileAds: 0 };
  selectedPublisher: string = '';
  newPublisherName: string = '';
  
  togglePublisherInput() {
    this.showPublisherInput = !this.showPublisherInput;
   }

   addPublisher() {
    const newPublisherName = this.newPublisherName.trim();

    if (newPublisherName) {
        fetch('http://localhost:3000/addPublisher', {
            headers: { 'Content-Type': 'application/json' },
            method: 'POST',
            body: JSON.stringify({ publisher: newPublisherName })
        })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            // Handle success response
        })
        .catch(error => {
            console.error('Error adding publisher:', error);
            // Handle error
        });

        this.showPublisherInput = false;
    }
}
addDomain() {
  const domainName = this.newDomain.domain.trim();
  const desktopAds = +this.newDomain.desktopAds;
  const mobileAds = this.newDomain.mobileAds;

  if (domainName !== '' && this.selectedPublisher !== '' && desktopAds !== 0 && mobileAds !== 0 && !this.isDomainExists(domainName)) {
    const selectedPublisherObj = this.data.find((publisher: Publisher) => publisher.publisher === this.selectedPublisher);
    if (selectedPublisherObj) {
      const newDomainData = { domain: domainName, desktopAds, mobileAds };
      fetch('http://localhost:3000/addDomain', {
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
        body: JSON.stringify({ publisher: selectedPublisherObj.publisher, domain: newDomainData })
      })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to add domain');
        }
        return res.json();
      })
      .then((data) => {
        console.log('Domain added successfully:', data);
        selectedPublisherObj.domains.push(newDomainData); // Update local data
        this.clearDomainInputs();
      })
      .catch((err) => {
        console.error('Error adding domain:', err);
        alert('Error adding domain. Please try again.');
      });
    }
  } else if (this.isDomainExists(domainName)) {
    alert(`This domain (${domainName}) is already configured on another publisher.`);
  } else {
    alert('Invalid domain details. Please check and try again.');
  }
}
  clearDomainInputs() {
    this.newDomain.domain = '';
    this.newDomain.desktopAds = 0;
    this.newDomain.mobileAds = 0;
    this.selectedPublisher = '';
  }
  isDomainExists(domainName: string): boolean {
    return this.data.some((publisher: Publisher) => publisher.domains.some((domain: Domain) => domain.domain === domainName));
  }
  
  toggleDomainInputs() {
    this.showDomainInputs = !this.showDomainInputs;
    if (!this.showDomainInputs) {
      this.clearDomainInputs();
    }
}

updateSelectedPublisher(event: Event) {
  const target = event.target as HTMLSelectElement;
  this.selectedPublisher = target.value;  
}}