import { v4 as uuidv4 } from 'uuid';
declare var PouchDB: any;
const db = new PouchDB('Neon-User-Storage');

export function getAllDocuments() {
  return new Promise((resolve, reject) => {
    db.allDocs({ include_docs: true }).then(result => { resolve(result); })
      .catch(err => { reject(err); });
  });
}

export function createManifest(mei: File, bg: File) {
  return new Promise(async (resolve) => {
    const manifest = await fetch('https://ddmal.music.mcgill.ca/Neon/contexts/1/manifest.jsonld')
      .then(result => {
        if (result.ok) {
          return result.json();
        }
      });
    manifest['@id'] = uuidv4();
    manifest['title'] = mei.name;
    manifest['timestamp'] = (new Date()).toISOString();

    let meiUri, bgUri;
    const meiPromise = new Promise(resolve => {
      const meiReader = new FileReader();
      meiReader.addEventListener('load', () => {
        resolve(meiReader.result);
      });
      meiReader.readAsDataURL(mei);
    });
    const bgPromise = new Promise(resolve => {
      const bgReader = new FileReader();
      bgReader.addEventListener('load', () => {
        resolve(bgReader.result);
      });
      bgReader.readAsDataURL(bg);
    });

    meiUri = await meiPromise;
    bgUri = await bgPromise;
    manifest['image'] = bgUri;
    manifest['mei_annotations'] = [
      {
        'id': uuidv4(),
        'type': 'Annotation',
        'body': meiUri,
        'target': bgUri
      }
    ];
    resolve(manifest);
  });
}

export function addEntry(title: string, content: Blob, single: boolean): Promise<boolean> {
  return new Promise((resolve, reject) => {
    db.put({
      _id: title,
      kind: single ? "page" : "manuscript",
      _attachments: {
        manifest: {
          content_type: 'application/ld+json',
          data: content
        }
      }
    }).then(_ => {
      resolve(true);
    }).catch(err => {
      reject(err);
      console.log(err);
      window.confirm('Upload unsuccessful. See console log for error message or continue to reload');
      window.location.reload();
    });
  });
}

export function deleteEntry(id: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    db.get(id).then(doc => {
      db.remove(doc).then(_ => {
        resolve(true);
      }).catch(err => reject(err));
    }).catch(err => reject(err));
  });
}
