import Defs, { TypeYTS } from '../assets/constatns';
import Utils from '../assets/utils';
import $ from 'jquery';
import Browser from 'webextension-polyfill';

const initialState: TypeYTS = {
  innerContainer: null,
  innerList: [],
  innerVideo: null,
  innerPlayerControl: null,
};

const ytsReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case Defs.REDUX_YTS_WAIT_FOR_VIDEO:
      state.innerVideo = action.innerVideo;
      state.innerContainer = action.innerContainer;
      state.innerList = action.innerList;
      state.innerPlayerControl = action.innerPlayerControl;
      break;
    case Defs.REDUX_YTS_NEXT_INNER:
      const index = state.innerList.indexOf(state.innerContainer);
      if (index > 0) {
        return state.innerList[index + 1];
      }
      break;
    case Defs.REDUX_YTS_LOOP_VIDEO:
      state.innerVideo?.setAttribute('loop', String(true));
      break;
    case Defs.REDUX_YTS_NEXT_VIDEO:
      state.innerVideo?.removeAttribute('loop');
      state.innerVideo.onended = async () => {
        const element = await ytsReducer(state, {
          type: Defs.REDUX_YTS_NEXT_INNER,
        });
        element.scrollIntoView({ block: 'end', behavior: 'smooth' });
        await Browser.runtime.sendMessage({ event: Defs.EVENT_PAGE_UPDATE });
      };
      break;
    case Defs.REDUX_YTS_CC:
      Utils.waitForElement('#ytp-caption-window-container').then((cc) => {
        const isCC = action.cc;
        if (cc) {
          if (isCC) $(cc).show();
          else $(cc).hide();
        }
      });
      break;
    case Defs.REDUX_YTS_PLAY_BACK_RATE:
      state.innerVideo.playbackRate = action.speed;
      break;
    case Defs.REDUX_YTS_WINDOW_OVERLAY:
      const { innerContainer } = state;
      if (innerContainer) {
        const _overlay = $(innerContainer).find('.overlay');

        if (action.clearWindowText) _overlay.css('display', 'none');
        else _overlay.css('display', 'block');
      }
      break;
    case Defs.REDUX_YTS_CONTROL_VIDEO_VOL:
      state.innerVideo.volume = action.vol;
      break;
    default:
      break;
  }

  return state;
};

export { ytsReducer };
