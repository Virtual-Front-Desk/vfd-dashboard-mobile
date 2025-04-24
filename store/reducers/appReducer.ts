import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CallDataState {
  currentCall: any;
}

const initialState: CallDataState = {
  currentCall: null,
};

export const callSlice = createSlice({
  name: "callSlice",
  initialState,
  reducers: {
    setCallData: (state, action: PayloadAction<any>) => {
      state.currentCall = action.payload;
    },
  },
});

export const { setCallData } = callSlice.actions;
export default callSlice.reducer;