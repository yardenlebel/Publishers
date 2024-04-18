import {Component, Input} from '@angular/core';
import {Domain} from "../publishers-container.component";
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";
import { Publisher } from '../publishers-container.component';

@Component({
  selector: 'app-domain-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './domain-card.component.html',
  styleUrl: './domain-card.component.css'
})
export class DomainCardComponent {
  @Input() domain!: Domain;
  isEdit: boolean = false;
  _domain!: Domain;
  @Input() data: Array<Publisher> = [];

  constructor() {
  }

  ngOnInit(): void {
    this._domain = JSON.parse(JSON.stringify(this.domain));
  }

  toggleEdit() {
    this.isEdit = !this.isEdit;
  }
  

  editDomain() {
    const newDomainName = this.domain.domain.trim();
    if (newDomainName !== '' && !this.isDomainExists(newDomainName)) {
      const updatedDomain = {
        domain: newDomainName,
        desktopAds: +this.domain.desktopAds,
        mobileAds: +this.domain.mobileAds
      };
  
      fetch('http://localhost:3000/updateDomain', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          oldDomainName: this.domain.domain,
          newDomain: updatedDomain
        })
      })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to update domain (${res.status} - ${res.statusText})`);
        }
        return res.json();
      })
      .then((data) => {
        console.log('Domain updated successfully:', data);
        this.toggleEdit();
      })
      .catch((err) => {
        console.error('Error updating domain:', err);
        alert('Error updating domain. Please try again.');
      });
    } else if (this.isDomainExists(newDomainName)) {
      console.log('exist');
      alert(`This domain (${newDomainName}) is already configured on another publisher.`);
    } else {
      alert('Invalid domain name');
    }
  }

  isDomainExists(domainName: string): boolean {
    return this.data.some(publisher => publisher.domains.some(domain => domain.domain === domainName));
  }
  deleteDomain() {
    const confirmation = confirm('Are you sure you want to delete this domain?');
    if (confirmation) {
      fetch(`http://localhost:3000/deleteDomain/${this.domain.domain}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to delete domain (${response.status} - ${response.statusText})`);
        }
        return response.json();
      })
      .then((data) => {
        console.log('Domain deleted successfully:', data);
        // Handle any UI updates or redirection after deletion
      })
      .catch((error) => {
        console.error('Error deleting domain:', error);
        alert('Error deleting domain. Please try again.');
      });
    }
  }
}
