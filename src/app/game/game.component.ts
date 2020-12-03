import { Component, OnInit } from '@angular/core';
import { Game } from 'src/models/game';
import { MatDialog } from '@angular/material/dialog';
import { DialogAddPlayerComponent } from '../dialog-add-player/dialog-add-player.component';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { HostListener } from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  game: Game;
  gameId: string;

  topMarginForPlayerNames = 5; // In REM
  marginBetweenNames = 8; // In REM

  constructor(
    private router: ActivatedRoute,
    private firestore: AngularFirestore,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.newGame();
    this.arrangePlayerDisplay();
    this.router.params.subscribe((params) => {
      this.gameId = params.id;
      this.processGameUpdates();
    });
  }

  /**
   * Subscribe to game-changes (e.g. currentPlayer, playedCards,...) in database and update local game object
   */
  processGameUpdates() {
    this.firestore
        .collection('games') // access 'games' collection in firebase
        .doc(this.gameId) // refer to a specific game via game-id
        .valueChanges()
        .subscribe((game: any) => {
          this.updateGameObject(game);
        });
  }

  /**
   * Update game-object according to database
   * @param game game-object containing details & status of current game
   */
  updateGameObject(game: any) {
    this.game.currentPlayer = game.currentPlayer;
    this.game.playedCards = game.playedCards;
    this.game.players = game.players;
    this.game.stack = game.stack;
    this.game.pickCardAnimation = game.pickCardAnimation;
    this.game.currentCard = game.currentCard;
  }

  @HostListener('window:resize', ['$event'])
  arrangePlayerDisplay() {
    let width = window.innerWidth;
    let height = window.innerHeight;
    if (width < 440 || height < 600) (this.setSmallUi())
    else if (width < 1200 || height < 800) (this.setMediumUi())
    else (this.setLargeUi())

    }
  
  setSmallUi() {
    this.marginBetweenNames = 2.75;
    this.topMarginForPlayerNames = 0.5;
  }

  setMediumUi() {
    this.marginBetweenNames = 4.5;
    this.topMarginForPlayerNames = 1;
    } 

  setLargeUi() {
    this.topMarginForPlayerNames = 3.5;
    this.marginBetweenNames = 6;
  }
  

  newGame() {
    this.game = new Game();
  }

  takeCard() {
    if (!this.game.pickCardAnimation) {
      this.fireGameChanges();
      this.saveGame();
      this.finishGameChanges();
    }
  }

  /**
   * Kick off card-animation and update current player & card stack
   */
  fireGameChanges() {
    this.game.currentCard = this.game.stack.pop();
    this.game.pickCardAnimation = true;
    this.game.currentPlayer++;
    this.game.currentPlayer = this.game.currentPlayer % this.game.players.length;
  }

  /**
   * Finish card-animation, update currentCard and save game changes
   */
  finishGameChanges() {
    setTimeout(() => {
      this.game.playedCards.push(this.game.currentCard);
      this.game.pickCardAnimation = false;
      this.saveGame();
    }, 1000);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(DialogAddPlayerComponent);

    dialogRef.afterClosed().subscribe((name: string) => {
      if (name && name.length > 0) {
        this.game.players.push(name);
        this.saveGame();
      }
    });
  }

  saveGame() {
    this.firestore
      .collection('games')
      .doc(this.gameId)
      .update(this.game.toJson());
  }
}


// checkImageCache() {
//   // Load from cache
//   character_image = images.find(function(img) {
//       return img.src.endsWith(currentCharacterImg.substring(currentCharacterImg.length-10, currentCharacterImg.length));
//   });
//   if(!character_image) { // Image is not in cache, load from hdd
//       character_image = new Image();
//       character_image.src = currentCharacterImg ;
//   }
// }
