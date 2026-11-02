import { getFamilyPhotos } from "@/lib/families";
import type { Media } from "@/lib/types";

/** The order the photos are pinned on the /happy-families wall (differs from the homepage wall). */
const WALL_ORDER = [
  "TUslu26Ueaq-", "OcgEePeBmGuu", "RYkyuv4DBCTC", "d267R4d3lMSv", "XqxhmNftVKic", "1II_yVrwWdOG",
  "bKP7vwN0R2OU", "ToVkYw_K3UrY", "stDfO2jMfvb_", "K-U7RwW9j2A9", "s23WYu0qJQ_h", "ab5hEGUKO4aY",
  "yEfM9sdMluCX", "_41LE-nBf847", "tuarxe-C9j5H", "UuJqjsRN-wKL", "qZ5mPGpLO-G9", "xHEMhVTwflC_",
  "QYUwdroeZC35", "rZE7ypWUH0wz", "Sg8iy_EOrJah", "CVsVLsnCV0L3", "1ziQH1fmyl-k", "2BoSaeBhLer8",
  "QLO4DWvoWlJY", "xaIi_2gMoj_N", "GyAYtgNRGHUw", "NCnzIyNwzZiC", "2RCKCPAW7oIk", "d9RWhCKfRHOc",
  "tI7E08CB-sVp", "uL-D7uBZjs12", "AK4nDMw3v53a", "SXZSpIZJimpQ", "NBeJ3y_g-Iee", "6Abv8pfqHoEA",
  "UFzHrheMHQmi", "937wIvKxefpy", "BxM75hECdt9p", "O88qTc2s7KH8", "PAAMBTTfmXOK", "9A74-QBbi78w",
  "0wEBefsp1F5j", "hu2K_kmYs7s9", "LpUvbTEyekwN", "dI8Jv0KRTiLJ", "TI-WtaFssfQt", "j6T9eswP2eS8",
  "HJgL4rRnmReV", "uc5ANs5jm7r7", "pRJubyqHw8p7", "4wOJk9azop_-", "2ZpD4FCAriYZ", "BarQuR6VS6XX",
  "l_M8IYdzFJHb", "aAf69e7YtFrb", "qesMnrX7cliq", "sqPa3JOR3OPc", "3h20rIasJCOa", "NaV9L3-u1vss",
  "EINH5_Xbws14", "wyDhW6yEQ6ef", "n6BJMOg_-QYI", "nTiIYDlSaIjG",
];

/** Family photos in wall order; any photo not listed goes at the end. */
export function getWallPhotos(): Media[] {
  const photos = getFamilyPhotos();
  const rank = new Map(WALL_ORDER.map((id, i) => [id, i]));
  return [...photos].sort((a, b) => (rank.get(a.id) ?? Infinity) - (rank.get(b.id) ?? Infinity));
}
