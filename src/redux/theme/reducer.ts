import { TOGGLE_THEME } from "./actions";

const initialState = {
  darkMode: true,
};

export const themeReducer = (state = initialState, action: any) => {
    console.log("Reducer received action:", action);
  switch (action.type) {
    case TOGGLE_THEME:
      return { ...state, darkMode: !state.darkMode };
    default:
      return state;
  }
};
