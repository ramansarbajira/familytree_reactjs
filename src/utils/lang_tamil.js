// Tamil Relationship Mapping - Universal, Gender-Aware
// Usage: tamilRelationships[code][gender] where code is a universal relationship code (e.g., FB+S) and gender is 'M' (male user) or 'F' (female user)
// Covers direct, sibling, in-law, uncle/aunt, cousin, grandparent, great-grandparent, and step relationships

const tamilRelationships = {
  // Core Family
  // Comprehensive Tamil Relationship Translations
// --- Universal Relationship Code Mapping ---
  F: "அப்பா", // Father
  M: "அம்மா", // Mother
  H: "கணவன்", // Husband
"elder sister": "அக்கா", // Elder sister
"younger sister": "தங்கை", // Younger sister
"Z+H": "மாமா", // Elder sister's husband
"Z-H": "கொழுந்தன்", // Younger sister's husband
"younger brother": "தம்பி", // Younger brother
"B-W": "நங்கை", // Younger brother's wife
daughter: "மகள்", // Daughter
son: "மகன்", // Son
"B-S": "மருமகன்", // Younger brother's son
"B-D": "மருமகள்", // Younger brother's daughter
"B+S": "மருமகன்", // Elder brother's son
"B+D": "மருமகள்", // Elder brother's daughter
"Z+S": "மகன்", // Elder sister's son
"Z+D": "மகள்", // Elder sister's daughter
"Z-S": "மகன்", // Younger sister's son
"Z-D": "மகள்", // Younger sister's daughter
SW: "மருமகள்", // Son's wife
DH: "மருமகன்", // Daughter's husband
grandson: "பேரன்", // Grandson
granddaughter: "பேத்தி", // Granddaughter
"grandmother (paternal)": "பாட்டி", // Paternal grandmother
"grandfather (paternal)": "தாத்தா", // Paternal grandfather
HFM: "பாட்டி", // Husband's father's mother
HFF: "தாத்தா", // Husband's father's father
"grandmother (maternal)": "பாட்டி", // Maternal grandmother
"grandfather (maternal)": "தாத்தா", // Maternal grandfather
"mother's younger brother": "மாமா", // Mother's younger brother
"MB-W": "மாமி", // Mother's younger brother's wife
"mother's younger sister": "சித்தி", // Mother's younger sister
"MZ-H": "சித்தப்பா", // Mother's younger sister's husband
"MB-S": "மாமா மகன்", // Mother's younger brother's son
"MB-SW": "சகோதிரி", // Mother's younger brother's son's wife
FFM: "கொல்லுப்பாட்டி", // Father's father's mother
FFF: "கொல்லுத்தாத்தா", // Father's father's father
"FFB+W": "பாட்டி", // Father's father's elder brother's wife
"FFB+": "தாத்தா", // Father's father's elder brother
"FFB+S": "பெரியப்பா/சித்தப்பா", // Father's father's elder brother's son
"FFB+SW": "பெரியம்மா/சித்தி", // Father's father's elder brother's son's wife
"FFB+DH": "மாமா", // Father's father's elder brother's daughter's husband
"FFB+D": "அத்தை", // Father's father's elder brother's daughter
"FZ+H": "மாமா", // Father's sister's husband
"father's elder sister": "அத்தை", // Father's elder sister
"FB+W": "பெரியம்மா", // Father's elder brother's wife
"father's elder brother": "பெரியப்பா", // Father's elder brother
"HFB-W": "மாமியார்", // Husband's father's younger brother's wife
"HFB-": "மாமனார்", // Husband's father's younger brother
"HFZ+H": "பெரியப்பா", // Husband's father's elder sister's husband
"HFZ+": "பெரியம்மா", // Husband's father's elder sister
HM: "மாமியார்", // Husband's mother
HF: "மாமனார்", // Husband's father
"HFZ-H": "சித்தப்பா", // Husband's father's younger sister's husband
"HFZ-": "சித்தி", // Husband's father's younger sister
"FFB+DD": "", // Father's father's elder brother's daughter's daughter
"FFB+DDH": "", // Father's father's elder brother's daughter's daughter's husband
"FZ+D": "சித்தி", // Father's sister's daughter
"FZ+SW": "மாமி", // Father's sister's son's wife
"FZ+S": "மாமா", // Father's sister's son
"MB-S": "மாமா மகன்", // Mother's younger brother's son
"FB+S": "அண்ணன்", // Father's elder brother's son
"FB+SW": "அண்ணி", // Father's elder brother's son's wife
"HFB-SW": "சகோதரி", // Husband's father's younger brother's son's wife
"HFB-S": "மச்சினன்", // Husband's father's younger brother's son
"HFB-DH": "சகோதரன்", // Husband's father's younger brother's daughter's husband
"HFB-D": "நாத்தனார்", // Husband's father's younger brother's daughter
"HZ-H": "மைத்துனர்", // Husband's sister's husband
"HZ-": "நாத்தனார்", // Husband's sister
"HFZ+S": "அத்தான்", // Husband's father's elder sister's son
"HFZ-DH": "அத்தான்", // Husband's father's younger sister's daughter's husband
"HFZ-D": "மாமியார்", // Husband's father's younger sister's daughter
"FZ+DD": "சகோதரி", // Father's sister's daughter's daughter
"FZ+DDH": "மாமா/மைத்துனர்", // Father's sister's daughter's daughter's husband
"FZ+SD": "மாமாவின் மகள்", // Father's sister's son's daughter
"FZ+SS": "மாமாவின் மகன்", // Father's sister's son's son
"FZ+DSW": "நங்கை", // Father's sister's daughter's son's wife
"FZ+DS": "சகோதரன்", // Father's sister's daughter's son
"MB-SS": "மகன்", // Mother's younger brother's son's son
"MB-SD": "மகள்", // Mother's younger brother's son's daughter
"FB+SSW": "மகள்", // Father's elder brother's son's son's wife
"FB+SS": "மருமகன்", // Father's elder brother's son's son
"HZ-S": "மருமகன்", // Husband's sister's son
"HFB-SD": "மகள்", // Husband's father's younger brother's son's daughter
"HFB-SS": "மகன்", // Husband's father's younger brother's son's son
"HFB-DD": "மருமகள்", // Husband's father's younger brother's daughter's daughter
"HFB-DS": "மருமகன்", // Husband's father's younger brother's daughter's son
"HFZ-DS": "சகோதரன்", // Husband's father's younger sister's daughter's son
"HFZ-DD": "சகோதரி", // Husband's father's younger sister's daughter's daughter
"FB+SDH": "மகன்", // Father's elder brother's son's daughter's husband
"FB+SD": "மருமகள்", // Father's elder brother's son's daughter
"HZ-DH": "மகன்", // Husband's sister's daughter's husband
"HZ-D": "மருமகள்", // Husband's sister's daughter
"FZ+DDS": "மகன்", // Father's sister's daughter's daughter's son
"FZ+DSD": "பேத்தி", // Father's sister's daughter's son's daughter
"FZ+DSDH": "பேரன்", // Father's sister's daughter's son's daughter's husband
"FB+SSS": "பேரன்", // Father's elder brother's son's son's son
"FB+SSD": "பேத்தி", // Father's elder brother's son's son's daughter
"FB+SDD": "பேத்தி", // Father's elder brother's son's daughter's daughter
"HZ-DS": "பேரன்", // Husband's sister's daughter's son
"HZ-DD": "பேத்தி", // Husband's sister's daughter's daughter
"FB+SDS": "பேரன்", // Father's elder brother's son's daughter's son
"FB+SDSD": "பேத்தி", // Father's elder brother's son's daughter's son's daughter

// Wife's family (from husband's perspective)
"WF": "மாமனார்", // Wife's father (father-in-law)
"WM": "மாமியார்", // Wife's mother (mother-in-law)
"WB+": "மச்சான்", // Wife's elder brother
"WB-": "மச்சான்", // Wife's younger brother
"WZ+": "மச்சினி", // Wife's elder sister
"WZ-": "மச்சினி", // Wife's younger sister

// Wife's siblings' spouses
"WB+W": "மச்சினி", // Wife's elder brother's wife
"WB-W": "மச்சினி", // Wife's younger brother's wife
"WZ+H": "மச்சான்", // Wife's elder sister's husband
"WZ-H": "மச்சான்", // Wife's younger sister's husband

// Wife's siblings' children (wife's nephews/nieces)
"WB+S": "மச்சான் மகன்", // Wife's elder brother's son
"WB+D": "மச்சான் மகள்", // Wife's elder brother's daughter
"WB-S": "மச்சான் மகன்", // Wife's younger brother's son
"WB-D": "மச்சான் மகள்", // Wife's younger brother's daughter
"WZ+S": "மச்சினி மகன்", // Wife's elder sister's son
"WZ+D": "மச்சினி மகள்", // Wife's elder sister's daughter
"WZ-S": "மச்சினி மகன்", // Wife's younger sister's son
"WZ-D": "மச்சினி மகள்", // Wife's younger sister's daughter

// Wife's grandparents
"WFF": "மாமனார் தாத்தா", // Wife's father's father
"WFM": "மாமனார் பாட்டி", // Wife's father's mother
"WMF": "மாமியார் தாத்தா", // Wife's mother's father
"WMM": "மாமியார் பாட்டி", // Wife's mother's mother

// Wife's uncles/aunts
"WFB+": "மாமனார் பெரியப்பா", // Wife's father's elder brother
"WFB-": "மாமனார் சித்தப்பா", // Wife's father's younger brother
"WFZ+": "மாமனார் பெரியம்மா", // Wife's father's elder sister
"WFZ-": "மாமனார் சித்தி", // Wife's father's younger sister
"WMB+": "மாமியார் பெரிய மாமா", // Wife's mother's elder brother
"WMB-": "மாமியார் மாமா", // Wife's mother's younger brother
"WMZ+": "மாமியார் பெரிய மாமி", // Wife's mother's elder sister
"WMZ-": "மாமியார் மாமி", // Wife's mother's younger sister

// Wife's uncle/aunt spouses
"WFB+W": "மாமனார் பெரியம்மா", // Wife's father's elder brother's wife
"WFB-W": "மாமனார் சித்தி", // Wife's father's younger brother's wife
"WFZ+H": "மாமனார் பெரியப்பா", // Wife's father's elder sister's husband
"WFZ-H": "மாமனார் சித்தப்பா", // Wife's father's younger sister's husband
"WMB+W": "மாமியார் பெரிய மாமி", // Wife's mother's elder brother's wife
"WMB-W": "மாமியார் மாமி", // Wife's mother's younger brother's wife
"WMZ+H": "மாமியார் பெரிய மாமா", // Wife's mother's elder sister's husband
"WMZ-H": "மாமியார் மாமா" // Wife's mother's younger sister's husband
};

export default tamilRelationships; 