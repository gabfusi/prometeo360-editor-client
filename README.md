# Prometeo

Prometeo è un applicazione web che consente di arricchire video con elementi interattivi, è composta da un editor e un player.
 - L'editor consente il montaggio dei filmati.
 - Il player consente la fruizione dei filmati.

Questo software è concesso in licenza [creative commons CC BY-NC-ND 3.0](https://creativecommons.org/licenses/by-nc-nd/3.0/it/deed.it)

### Legenda
 - Video: Un file video
 - Filmato: (o Lezione) L'output di Prometeo, ovvero una sequenza di zero o più video arricchiti con zero o più elementi interattivi, chiamati *Aree* o *Elementi*.
 - Area: un elemento interattivo presente in un *Filmato*.
 - Amministratore: un utente in grado di creare video su Prometeo

### Tecnologie utilizzate
La parte client è stata implementata con Javascript, HTML5 (utilizzando Handlebars come sistema di templating), CSS (utilizzando SCSS come preprocessore per i file CSS).
La parte server è stata implementata con Javascript, utilizzando Node.js; per la base dati è stato creato un semplice database CouchDB, contenente due viste; una per i filmati, l'altra per i video.


### Filesystem
- */bin/* contiene lo script di startup del server (utilizzando [express](https://expressjs.com/)).
- */node_modules/* contiene i module node utilizzati per il server (ad esempio express, un adapter per ffmpeg, nano per comunicare con il database, etc).
- */public/* è la root del sito web, all'interno di questa cartella sono presenti tutti i files per la parte client dell'editor e del player.
- */routes/* contiene i files che si occupano del routing lato server dell'applicazione, come per esempio tutti gli endpoint delle API.
- */services/* contiene i servizi del server, ovvero un adapter per il database che viene utilizzato dagli altri due servizi (VideoService e LessonsService) i quali si occupano di esporre dei metodi per il salvataggio, l'inserimento, la cancellazione e la selezione di video e filmati. VideoService e LessonsService vengono utilizzati all'interno delle routes (endpoint)
- */uploads/* contiene i video caricati dagli amministratori e i loro screenshots.
- */views/* contiene i templates Handlebars per la creazione di file HTML statici lato server.
- */app.js* è il file che contiene le istruzioni di configurazione del server.


### Client: Il Filesystem
L'applicazione lato client adotta un architettura MVC (Model View Controller)
- */public/js/* contiene i files Javascript di editor e player (separati)
- */public/js/libs/* contiene le librerie esterne utilizzate per facilitare l'implementazione
- */public/js/app/* contiene il codice di prometeo creato ad-hoc
- */public/js/app/editor/* contiene il codice dell'editor (Controllers e Views)
- */public/js/app/viewer/* contiene il codice del player (Controllers e Views)
- /public/js/app/models/* contiene i file che compongono il modello di dati (Model) di un Filmato, tali file sono condivisi dall'editor e dal player.
- */public/css* contiene i fogli di stile di editor e player

### Client: Struttura sommaria
L'editor e il player sono implementati utilizzando [requirejs](http://requirejs.org/) come sistema di gestione delle dipendenze.
I file che modellano le Aree interattive si basano su ereditarietà multipla, la classe di riferimento è TimelineElement che viene estesa sia dalla classe Video che dalla classe Area, la quale viene estesa a sua volta dalle classi LinkArea, TextArea, JumpArea e QuestionArea.
All'interno del player ogni Modello ha il corrispettivo Controller, il quale si occupa di renderizzare la specifica View del modello e renderla interattiva.
Sia l'editor che il player hanno il proprio dispatcher di eventi (implementato utilizzando gli eventi custom di jQuery), tali dispatcher rendono possibile la comunicazione passiva (e in qualche raro caso anche attiva) tra i Controller (qualche esempio di evento: video caricato, video messo in pausa, filmato salvato, etc etc)

### Server: il salvataggio dei Video
I video caricati vengono compressi e convertiti in formato MPEG-4 poichè tale formato è sufficiente per una [accettabile compatibilità cross-browser](http://caniuse.com/#feat=mpeg4).
Per ogni video caricato vengono create due versioni, una in 720p (per desktop), l'altra in 320p (per mobile). La conversione e la compressione dei video viene effettuata tramite l'utilizzo di ffmpeg.

### Supporto per dispositivi mobili
L'editor e il player sono mobile-friendly (anche se la natura dell'editor non consente una facile fruizione dello stesso da dispositivi mobili).
Dato che la posizione delle Aree interattive all'interno del Filmato utilizza come unità di misura il pixel, la soluzione adottata per il ridimensionamento dei Filmati è stata implementata in parte con javascript e in parte con css, utilizzando l'attributo di trasformazione *scale*; sommariamente: Javascript individua quando la dimensione del viewport è inferiore alla dimensione standard del Filmato (720x480px) e calcola il valore che dovrà assumere il parametro della funzione di trasformazione CSS *scale*. Per rendere l'idea: ```.player{ transform: scale(zoom); }```, 
Il player è stato testato su più dispositivi android utilizzando chrome, dando risultati abbastanza soddisfacenti. Infatti dalla seconda metà del 2015 le versioni di chrome per android non consentono la riproduzione 'forzata' di elementi multimediali (MediaElements); per questa ragione ogni video per essere riprodotto ha bisogno di un'azione (touch) da parte del fruitore, quindi ad ogni 'stacco' tra un video e l'altro viene mostrato un overlay che consente di riprendere la riproduzione del Filmato.





