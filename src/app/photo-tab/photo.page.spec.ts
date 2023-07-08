import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoPage } from './photo.page';

describe('PhotoPage', () => {
  let component: PhotoPage;
  let fixture: ComponentFixture<PhotoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoPage],
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
