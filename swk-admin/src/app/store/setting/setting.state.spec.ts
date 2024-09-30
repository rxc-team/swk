// import { SettingState } from './setting.state';
// import { SettingAction } from './setting.actions';

// describe('Setting actions', () => {
//   let store: Store;

//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       imports: [NgxsModule.forRoot([SettingState])]
//     }).compileComponents();
//     store = TestBed.get(Store);
//   }));

//   it('should create an action and add an item', () => {
//     store.dispatch(new SettingAction('item-1'));
//     store.select(state => state.setting.items).subscribe((items: string[]) => {
//       expect(items).toEqual(jasmine.objectContaining([ 'item-1' ]));
//     });
//   });

// });
