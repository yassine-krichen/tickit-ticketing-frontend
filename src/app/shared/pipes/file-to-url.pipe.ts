import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fileToUrl'
})
export class FileToUrlPipe implements PipeTransform {
  transform(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!file) {
        reject('No file provided');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject('Error reading file');
      };
      reader.readAsDataURL(file);
    });
  }
}
