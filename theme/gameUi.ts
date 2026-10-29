export const HELP_BUTTON_ICON_SIZE = 72;
export const HELP_BUTTON_HIT_SLOP = 8;

export function isHelpButtonVisible(isSimpleMode: boolean, _isActive: boolean): boolean {
  return !isSimpleMode;
}
