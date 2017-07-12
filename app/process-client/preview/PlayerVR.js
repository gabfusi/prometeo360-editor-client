"use strict";

(function (undefined) {

  /**
   *
   * @constructor
   */
  function PlayerVR(movie, options) {

    if (typeof window.VRView === 'undefined') {
      console.error("PlayerVR needs VRView.Player!");
      return;
    }

    if (!movie) {
      console.error("PlayerVR needs a movie to start!");
      return;
    }

    // data & logic
      this.options = options || {};
      this.options.videoPath = (options.videoPath || '/uploads/videos') + '/';
    this.movie = movie;
    this.vrView = null;
    this.currentScene = null;

    // UI
    this.$playButton = document.querySelector('#toggleplay');
    this.$timeContainer = document.querySelector('#time');

    // start
    this.init();
  }

  /**
   *
   */
  PlayerVR.prototype.init = function () {

    // load first movie scene
    var vrView;
    var firstScene = this.movie.scenes[0];

    var sceneParams = {
      width: '100%',
      height: '100%',
      video: false,
      preview: 'blank.png',
      is_stereo: false,
      is_autopan_off: true
    };

    if (firstScene.video) {
      sceneParams.video = this.options.videoPath + firstScene.video;
    }

    this.$playButton.addEventListener('click', this.onTogglePlay_.bind(this));

    vrView = new VRView.Player('#vrview', sceneParams, {
      autoplay: false
    });

    vrView.on('ready', this.onVRViewReady_.bind(this));
    vrView.on('timeupdate', this.onTimeUpdate_.bind(this));
    vrView.on('ended', this.onSceneEnded_.bind(this));
    vrView.on('shapeselected', this.onShapeSelected_.bind(this));

    this.vrView = vrView;
    this.currentScene = firstScene;
  };

  /**
   *
   * @private
   */
  PlayerVR.prototype.onVRViewReady_ = function () {
    // Set the initial state of the buttons.
    if (this.vrView.isPaused) {
      this.$playButton.classList.add('paused');
    } else {
      this.$playButton.classList.remove('paused');
    }

    this.loadInteractiveAreas_(this.getFirstScene_());
  };

  /**
   * on play/pause button clicked
   * @private
   */
  PlayerVR.prototype.onTogglePlay_ = function () {
    if (this.vrView.isPaused) {
      this.vrView.play();
      this.$playButton.classList.remove('paused');
    } else {
      this.vrView.pause();
      this.$playButton.classList.add('paused');
    }
  };

  /**
   * On video time update
   * @param e
   * @private
   */
  PlayerVR.prototype.onTimeUpdate_ = function (e) {
    var current = formatTime(e.currentTime);
    var duration = formatTime(e.duration);
    this.$timeContainer.innerText = current + ' | ' + duration;
  };

  /**
   * on video ended
   * @private
   */
  PlayerVR.prototype.onSceneEnded_ = function () {
    this.$playButton.classList.add('paused');
  };

  /**
   * on shape selected
   * @param shape
   * @private
   */
  PlayerVR.prototype.onShapeSelected_ = function (shape) {
    var area = this.getInteractiveArea_(shape.id);

    if(area.linkedSceneId) {
      this.changeScene(area.linkedSceneId)
    }
    console.log('shapeselected', shape.id, area);
  };

  /**
   * get first movie scene
   * @returns {*}
   * @private
   */
  PlayerVR.prototype.getFirstScene_ = function () {
    return this.movie.scenes[0];
  };

  /**
   * get a movie scene
   * @param scene_id
   * @returns {*}
   * @private
   */
  PlayerVR.prototype.getScene_ = function (scene_id) {
    for (var i = 0; i < this.movie.scenes.length; i++) {
      if (scene_id === this.movie.scenes[i].id) {
        return this.movie.scenes[i];
      }
    }
  };

  /**
   * returns an interactive area of the current scene
   * @param area_id
   * @returns {*}
   * @private
   */
  PlayerVR.prototype.getInteractiveArea_ = function (area_id) {
    for (var i = 0; i < this.currentScene.elements.length; i++) {
      if (area_id === this.currentScene.elements[i].id) {
        return this.currentScene.elements[i];
      }
    }
  };

  /**
   * change current presented scene
   * @param scene_id
   */
  PlayerVR.prototype.changeScene = function (scene_id) {

    var scene = this.getScene_(scene_id);
    var sceneParams = {
      width: '100%',
      height: '100%',
      video: false,
      preview: 'blank.png',
      is_stereo: false,
      is_autopan_off: true,
      autoplay: true
    };

    if (scene.video) {
      sceneParams.video = this.options.videoPath + scene.video;
    }

    this.vrView.setContent(sceneParams);

    this.loadInteractiveAreas_(scene);

    this.currentScene = scene;

  };

  /**
   * load interactive areas of a scene
   * @param scene
   * @private
   */
  PlayerVR.prototype.loadInteractiveAreas_ = function (scene) {

    // add shapes
    var shapes = scene.elements;
    var initialShapeVertices, i, j;
    for (i = 0; i < shapes.length; i++) {
      initialShapeVertices = shapes[i].keyframes;

      j = 0;
      for (var keyframe in initialShapeVertices) {

        if (j === 0) {

          this.vrView.addShape(shapes[i].id, initialShapeVertices[keyframe]);

          this.vrView.editShape(shapes[i].id, {
            background_color: shapes[i].background,
            background_opacity: shapes[i].backgroundOpacity,
            start_frame: shapes[i].frame / 1000,
            end_frame: (shapes[i].frame + shapes[i].duration) / 1000
          });

          console.log("Loading shape " + shapes[i].id + " - from " + shapes[i].frame / 1000 + " to " + (shapes[i].frame + shapes[i].duration) / 1000)

        } else {
          this.vrView.addShapeKeyframe(shapes[i].id, keyframe / 1000, initialShapeVertices[keyframe]);
        }

        j++;
      }
    }

    // quick fix, fixme!
    this.vrView.setCurrentTime(0.01);
    this.vrView.setCurrentTime(0);

  };

  /**
   * helper format time fn
   * @param time
   * @returns {string}
   */
  function formatTime(time) {
    time = !time || typeof time !== 'number' || time < 0 ? 0 : time;

    var minutes = Math.floor(time / 60) % 60;
    var seconds = Math.floor(time % 60);

    minutes = minutes <= 0 ? 0 : minutes;
    seconds = seconds <= 0 ? 0 : seconds;

    var result = (minutes < 10 ? '0' + minutes : minutes) + ':';
    result += seconds < 10 ? '0' + seconds : seconds;
    return result;
  }

  // export module
  window.PlayerVR = PlayerVR;

})();