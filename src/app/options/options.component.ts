import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

import { getAllDocuments, createManifest, addEntry, deleteEntry } from './storage';
import { pages } from './documents';

function makeParams(obj: object): string {
  return Object.keys(obj).map(key => {
    return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
  }).join('&');
}

@Component({
  selector: 'app-options',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.css']
})
export class OptionsComponent implements OnInit {
  selectOrUpload: string = '';
  pageOrManuscript: string = '';
  pageOrManifest: string = '';
  pageSelect: string = '';
  submitLoading = false;
  deleteLoading = false;

  formGroup1 = new FormGroup({
    selectOrUpload: new FormControl(this.selectOrUpload,
      Validators.required)
  });

  formGroup2 = new FormGroup({
    pageOrManuscript: new FormControl(this.pageOrManuscript,
      Validators.required)
  });

  formGroup3_1 = new FormGroup({
    pageSelect: new FormControl(this.pageSelect,
      Validators.required)
  });

  formGroup3_2 = new FormGroup({
    manuscriptSelect: new FormControl('',
      Validators.required)
  });

  formGroup3_3 = new FormGroup({
    meiUpload: new FormControl('',
      Validators.required),
    bgUpload: new FormControl('',
      Validators.required)
  });

  formGroup3_4 = new FormGroup({
    manifestUpload: new FormControl('',
      Validators.required)
  });

  formGroup3_5 = new FormGroup({
    selection: new FormControl('',
      Validators.required)
  });

  formGroup3_6 = new FormGroup({
    selection: new FormControl('',
      Validators.required)
  });

  addedPages: string[] = [];
  addedManuscripts: string[] = [];
  pagesOrig: string[];
  pages: string[];

  constructor() { }

  ngOnInit() {
    this.pagesOrig = pages;
    this.pages = pages;
    getAllDocuments().then(response => {
      for (const doc of response['rows']) {
        if (doc.doc.kind === "page") {
          this.addedPages.push(doc.key);
        }
        else {
          this.addedManuscripts.push(doc.key);
        }
        console.debug(doc);
      }
    });
  }

  handleSubmit(e: string) {
    console.debug("Submit");
    console.debug(e);

    let params;
    let selection;
    let isConfirmDelete;

    switch (e) {
      case "formGroup3_1":
        this.submitLoading = true;
        let value = this.formGroup3_1.controls.pageSelect.value;
        params = makeParams({ manifest: value });
        window.location.href = "./editor.html?" + params;
        break;
      case "formGroup3_2":        
        this.submitLoading = true;
        params = makeParams({
          manifest: this.formGroup3_2.controls.manuscriptSelect.value
        });
        window.location.href = "./editor.html?" + params;
        break;
      // Upload page
      case "formGroup3_3":
        this.submitLoading = true;
        let mei: File = (document.getElementById("meiUpload") as HTMLInputElement).files[0];
        let bg: File = (document.getElementById("bgUpload") as HTMLInputElement).files[0];
        createManifest(mei, bg).then(manifest => {
          const manifestBlob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/ld+json' });
          return addEntry(mei.name, manifestBlob, true);
        }).then(_ => {
          window.location.reload();
        }).catch(err => {
          console.error(err);
        });
        break;
      // Upload manuscript
      case "formGroup3_4":
        this.submitLoading = true;
        let manifest: File = (document.getElementById("manifestUpload") as HTMLInputElement).files[0];
        addEntry(manifest.name, manifest, false).then(_ => {
          window.location.reload();
        }).catch(err => {
          console.error(err);
        });
        break;
      // Load user-provided page
      case "formGroup3_5":
        this.submitLoading = true;
        selection = this['formGroup3_5'].controls.selection.value;
        console.log(selection);
        params = makeParams({ storage: selection });
        window.location.href = `./editor.html?${params}`;
        break;
      // Load user-provided manuscript
      case "formGroup3_6":
        this.submitLoading = true;
        selection = this['formGroup3_6'].controls.selection.value;
        params = makeParams({ storage: selection });
        window.location.href = `./editor.html?${params}`;
      // Delete Page
      case "deleteDocument3_5":
        selection = this['formGroup3_5'].controls.selection.value;
        isConfirmDelete = window.confirm(`This action is irreversible! Are you sure you want to delete ${selection}?`);
        // if user confirms, delete document
        if (isConfirmDelete) {
          this.deleteLoading = true;
          deleteEntry(selection).then( _ => {
            window.location.reload();
          }).catch(err => {
            console.error(err);
          });
        }
        break;
      // Delete Manuscript
      case "deleteDocument3_6":
        selection = this['formGroup3_6'].controls.selection.value;
        isConfirmDelete = window.confirm(`This action is irreversible! Are you sure you want to delete ${selection}?`);
        // if user confirms, delete document
        if (isConfirmDelete) {
          this.deleteLoading = true;
          deleteEntry(selection).then( _ => {
            window.location.reload();
          }).catch(err => {
            console.error(err);
          });
        }
        break;
      default:
        console.error("Unexpected ID: " + e);
        break;
    }
  }

}
