export interface Lesson {
  id: string;
  title: string;
  keyPoints: string[];
  examples: { q: string; s: string[]; a: string }[];
}

export interface Chapter {
  id: string;
  title: string;
  emoji: string;
  color: string;
  blurb: string;
  lessons: Lesson[];
}

export const CHAPTERS: Chapter[] = [
  {
    id: "numbers",
    title: "Numbers & Place Value",
    emoji: "🔢",
    color: "#e74c3c",
    blurb: "Understand how numbers are built and what each digit means.",
    lessons: [
      {
        id: "numbers-place",
        title: "Place Value",
        keyPoints: [
          "Each digit in a number has a value based on its position (ones, tens, hundreds...).",
          "In 462, the 4 is worth 400, the 6 is worth 60, and the 2 is worth 2.",
          "Place value helps us read, compare, and round big numbers.",
        ],
        examples: [
          { q: "What is the value of the 7 in 5,749?", s: ["The 7 is in the hundreds place.", "So its value is 700."], a: "700" },
          { q: "Write 3,000 + 500 + 40 + 2 as a single number.", s: ["Combine each part in order of place value.", "3 thousands, 5 hundreds, 4 tens, 2 ones."], a: "3,542" },
        ],
      },
      {
        id: "numbers-compare",
        title: "Comparing & Ordering",
        keyPoints: [
          "Use <, > and = to compare numbers by looking at the largest place value first.",
          "When numbers have the same digit count, compare digit by digit from the left.",
          "A number line helps you see which number is bigger or smaller.",
        ],
        examples: [
          { q: "Which is bigger: 932 or 1,045?", s: ["1,045 has four digits, 932 has three.", "Numbers with more digits are always bigger."], a: "1,045" },
          { q: "Put in order from smallest: 7, 12, 3, 9", s: ["Compare all the numbers to find the smallest.", "Then arrange the rest in ascending order."], a: "3, 7, 9, 12" },
        ],
      },
      {
        id: "numbers-round",
        title: "Rounding",
        keyPoints: [
          "Rounding makes numbers easier to work with and estimate.",
          "To round to the nearest ten, look at the ones digit: 0–4 rounds down, 5–9 rounds up.",
          "The same rule works for rounding to tens, hundreds or thousands.",
        ],
        examples: [
          { q: "Round 47 to the nearest ten.", s: ["The ones digit is 7, which is 5 or more.", "So we round up."], a: "50" },
          { q: "Round 1,250 to the nearest hundred.", s: ["Look at the tens digit (5).", "5 or more rounds up, so 1,250 → 1,300."], a: "1,300" },
        ],
      },
    ],
  },
  {
    id: "addsub",
    title: "Addition & Subtraction",
    emoji: "➕",
    color: "#0984e3",
    blurb: "Master the building blocks of arithmetic.",
    lessons: [
      {
        id: "addsub-addition",
        title: "Addition with Carrying",
        keyPoints: [
          "Line up numbers by their place value before adding.",
          "Start from the ones column and work left.",
          "If a column adds to 10 or more, carry the extra ten to the next column.",
        ],
        examples: [
          { q: "Add: 48 + 37", s: ["8 + 7 = 15, write 5, carry 1.", "1 + 4 + 3 = 8."], a: "85" },
          { q: "Add: 156 + 289", s: ["6 + 9 = 15, carry 1.", "5 + 8 + 1 = 14, carry 1.", "1 + 1 + 2 + 1 = 4."], a: "445" },
        ],
      },
      {
        id: "addsub-subtraction",
        title: "Subtraction with Borrowing",
        keyPoints: [
          "Line numbers up by place value, with the bigger number on top.",
          "If a top digit is too small to subtract from, borrow 1 ten from the next column.",
          "Always check your answer: answer + the subtracted number = the original.",
        ],
        examples: [
          { q: "Subtract: 52 − 27", s: ["2 − 7 is too small, borrow: 12 − 7 = 5.", "4 − 2 = 2."], a: "25" },
          { q: "Subtract: 300 − 145", s: ["Borrow across the zeros: 10 − 5 = 5.", "9 − 4 = 5, 2 − 1 = 1."], a: "155" },
        ],
      },
      {
        id: "addsub-estimate",
        title: "Estimating with Rounding",
        keyPoints: [
          "Estimate by rounding numbers first, then doing an easier calculation.",
          "Estimates are quick checks to see if your exact answer makes sense.",
          "An estimate is close, not exact — that's fine for quick checks!",
        ],
        examples: [
          { q: "Estimate 197 + 324", s: ["Round: 197 ≈ 200 and 324 ≈ 300.", "200 + 300 = 500."], a: "about 500" },
          { q: "Estimate 9,800 − 4,100", s: ["Round: 9,800 ≈ 10,000 and 4,100 ≈ 4,000.", "10,000 − 4,000 = 6,000."], a: "about 6,000" },
        ],
      },
    ],
  },
  {
    id: "muldiv",
    title: "Multiplication & Division",
    emoji: "✖️",
    color: "#f39c12",
    blurb: "Times tables, factors and sharing things out.",
    lessons: [
      {
        id: "muldiv-tables",
        title: "Times Tables",
        keyPoints: [
          "Multiplication is repeated addition: 4 × 3 = 3 + 3 + 3 + 3.",
          "Any number × 10 just adds a zero at the end.",
          "Multiplying by 9: the digits of the answer always add up to 9 (e.g. 4×9=36, 3+6=9).",
        ],
        examples: [
          { q: "What is 7 × 8?", s: ["Use the pattern: 7×8 = 8×7 = 56.", "Think of the 7-times table row: 7, 14, 21... 56."], a: "56" },
          { q: "What is 6 × 9?", s: ["9 times a number: digits of the answer add to 9.", "6×9 = 54, and 5 + 4 = 9."], a: "54" },
        ],
      },
      {
        id: "muldiv-grid",
        title: "Long Multiplication",
        keyPoints: [
          "Split a big multiplication into smaller steps using the grid method.",
          "Multiply each part separately, then add the results together.",
          "34 × 12 = (34 × 10) + (34 × 2) = 340 + 68 = 408.",
        ],
        examples: [
          { q: "Work out 23 × 4 using partitioning.", s: ["23 = 20 + 3.", "20 × 4 = 80, 3 × 4 = 12.", "80 + 12 = 92."], a: "92" },
          { q: "Work out 15 × 12.", s: ["15 × 12 = (15 × 10) + (15 × 2).", "150 + 30."], a: "180" },
        ],
      },
      {
        id: "muldiv-division",
        title: "Division & Remainders",
        keyPoints: [
          "Division splits a number into equal groups: 20 ÷ 4 means 'how many 4s in 20?'.",
          "Multiplication and division are inverse — 20 ÷ 4 = 5 because 5 × 4 = 20.",
          "If a number doesn't divide evenly, the leftover is called the remainder.",
        ],
        examples: [
          { q: "What is 36 ÷ 9?", s: ["Ask: 9 × ? = 36.", "9 × 4 = 36."], a: "4" },
          { q: "Share 29 sweets equally between 6 friends.", s: ["6 × 4 = 24, with 29 − 24 = 5 left.", "Each gets 4, with 5 left over."], a: "4 remainder 5" },
        ],
      },
    ],
  },
  {
    id: "fractions",
    title: "Fractions",
    emoji: "🍰",
    color: "#e84393",
    blurb: "Pieces of a whole: numerators, denominators and beyond.",
    lessons: [
      {
        id: "fractions-intro",
        title: "What is a Fraction?",
        keyPoints: [
          "A fraction is a part of a whole. The denominator (bottom) tells how many equal parts, the numerator (top) tells how many you have.",
          "1/4 means 1 out of 4 equal parts.",
          "The bigger the denominator, the smaller each part (for the same numerator).",
        ],
        examples: [
          { q: "You eat 2 slices of a pizza cut into 8 slices. What fraction is left?", s: ["Eaten = 2/8.", "Left = 8/8 − 2/8 = 6/8."], a: "6/8" },
          { q: "Which is bigger: 1/3 or 1/5?", s: ["Both are 1 out of a whole.", "Smaller denominator = bigger piece."], a: "1/3" },
        ],
      },
      {
        id: "fractions-equivalent",
        title: "Equivalent Fractions",
        keyPoints: [
          "Equivalent fractions are equal even though they look different (1/2 = 2/4 = 4/8).",
          "Multiply or divide the top and bottom by the same number to make an equivalent fraction.",
          "Simplify a fraction by dividing top and bottom by their greatest common factor.",
        ],
        examples: [
          { q: "Simplify 8/12.", s: ["Both 8 and 12 divide by 4.", "8 ÷ 4 = 2, 12 ÷ 4 = 3."], a: "2/3" },
          { q: "Write 3/4 as a fraction with denominator 20.", s: ["Multiply top and bottom by 5.", "3 × 5 = 15, 4 × 5 = 20."], a: "15/20" },
        ],
      },
      {
        id: "fractions-add",
        title: "Adding & Subtracting Fractions",
        keyPoints: [
          "To add or subtract fractions, the denominators must be the same.",
          "If they differ, first convert to equivalent fractions with a common denominator.",
          "Then just add or subtract the numerators.",
        ],
        examples: [
          { q: "What is 1/4 + 2/4?", s: ["Same denominator, so add numerators.", "1 + 2 = 3, over 4."], a: "3/4" },
          { q: "What is 1/2 + 1/4?", s: ["Common denominator is 4.", "1/2 = 2/4, so 2/4 + 1/4 = 3/4."], a: "3/4" },
        ],
      },
    ],
  },
  {
    id: "decimals",
    title: "Decimals",
    emoji: "💧",
    color: "#00cec9",
    blurb: "Numbers between whole numbers, using the decimal point.",
    lessons: [
      {
        id: "decimals-place",
        title: "Tenths & Hundredths",
        keyPoints: [
          "The decimal point separates whole parts from parts smaller than 1.",
          "The first digit after the point is tenths (1/10), the second is hundredths (1/100).",
          "0.5 is the same as 5/10 = 1/2.",
        ],
        examples: [
          { q: "What place value is the 7 in 3.27?", s: ["After the decimal point: 2 is tenths, 7 is hundredths."], a: "hundredths" },
          { q: "Write 35/100 as a decimal.", s: ["35 hundredths = 0.35.", "0 ones, 3 tenths, 5 hundredths."], a: "0.35" },
        ],
      },
      {
        id: "decimals-arith",
        title: "Adding & Subtracting Decimals",
        keyPoints: [
          "Line up the decimal points before adding or subtracting.",
          "Fill gaps with zeros so every number has the same number of decimal places.",
          "Carry and borrow exactly like with whole numbers.",
        ],
        examples: [
          { q: "What is 2.5 + 1.75?", s: ["Line up: 2.50 + 1.75.", "0.50 + 0.75 = 1.25, carry the 1.", "2 + 1 + 1 = 4."], a: "4.25" },
          { q: "What is 5.0 − 1.25?", s: ["Line up: 5.00 − 1.25.", "Borrow: 4.100 − 1.25 = 3.75."], a: "3.75" },
        ],
      },
      {
        id: "decimals-convert",
        title: "Fractions to Decimals",
        keyPoints: [
          "Divide the numerator by the denominator to turn a fraction into a decimal.",
          "Some fractions become recurring decimals like 1/3 = 0.333...",
          "1/10, 1/100 and 1/1000 map directly to decimal places.",
        ],
        examples: [
          { q: "Write 3/4 as a decimal.", s: ["3 ÷ 4 = 0.75.", "Or: 3/4 = 75/100 = 0.75."], a: "0.75" },
          { q: "Write 1/8 as a decimal.", s: ["1 ÷ 8 = 0.125."], a: "0.125" },
        ],
      },
    ],
  },
  {
    id: "percentages",
    title: "Percentages",
    emoji: "💯",
    color: "#6c5ce7",
    blurb: "Parts out of 100, everywhere from shopping to sport.",
    lessons: [
      {
        id: "pct-intro",
        title: "What is a Percentage?",
        keyPoints: [
          "Percent means 'out of 100'. 50% means 50 out of every 100.",
          "100% is the whole thing. 0% is nothing.",
          "Percentages, fractions and decimals are three ways to write the same idea.",
        ],
        examples: [
          { q: "Write 70% as a fraction and a decimal.", s: ["Fraction: 70/100 = 7/10.", "Decimal: 70 ÷ 100 = 0.7."], a: "7/10 and 0.7" },
          { q: "There are 20 questions and you get 85%. How many did you get right?", s: ["85% of 20 = 0.85 × 20.", "0.85 × 20 = 17."], a: "17" },
        ],
      },
      {
        id: "pct-of",
        title: "Finding a Percentage of a Number",
        keyPoints: [
          "To find a % of a number: change the % to a decimal and multiply.",
          "10% is easy: just divide by 10.",
          "50% is half, 25% is a quarter — useful shortcuts.",
        ],
        examples: [
          { q: "Find 20% of 60.", s: ["20% = 0.2.", "0.2 × 60 = 12."], a: "12" },
          { q: "Find 15% of 80.", s: ["10% = 8 and 5% = 4.", "8 + 4 = 12."], a: "12" },
        ],
      },
      {
        id: "pct-change",
        title: "Percentage Increase & Decrease",
        keyPoints: [
          "A price rise of 10% on £50: find 10% (£5) and add it on → £55.",
          "A discount of 25% on £80: find 25% (£20) and subtract → £60.",
          "Increase by % means multiply by (1 + %/100); decrease means multiply by (1 − %/100).",
        ],
        examples: [
          { q: "A jacket costs £40 and is reduced by 15%. What's the new price?", s: ["15% of 40 = 6.", "40 − 6 = 34."], a: "£34" },
          { q: "A phone battery starts at 40% and increases by 50% of itself. New level?", s: ["50% of 40 = 20.", "40 + 20 = 60."], a: "60%" },
        ],
      },
    ],
  },
  {
    id: "ratios",
    title: "Ratio & Proportion",
    emoji: "⚖️",
    color: "#d63031",
    blurb: "Comparing amounts and scaling recipes up and down.",
    lessons: [
      {
        id: "ratio-intro",
        title: "Understanding Ratio",
        keyPoints: [
          "A ratio compares quantities. The ratio 3:2 of juice to water means 3 parts juice for every 2 parts water.",
          "Ratios can be simplified just like fractions, by dividing both sides.",
          "The order matters: 3:2 is not the same as 2:3.",
        ],
        examples: [
          { q: "Simplify the ratio 12:8.", s: ["Divide both sides by 4.", "12 ÷ 4 = 3, 8 ÷ 4 = 2."], a: "3:2" },
          { q: "A mix is made with 2 parts red to 5 parts blue. If you use 6 tins of red, how many blue?", s: ["The ratio 2:5 is scaled by 3.", "5 × 3 = 15."], a: "15" },
        ],
      },
      {
        id: "ratio-proportion",
        title: "Direct Proportion",
        keyPoints: [
          "Two quantities are in direct proportion if one doubles when the other doubles.",
          "Set up a 'per one' value, then scale it up — this is the unitary method.",
          "Proportion is everywhere: ingredients, currency exchange, speed and distance.",
        ],
        examples: [
          { q: "3 apples cost 90p. How much for 5 apples?", s: ["1 apple costs 90 ÷ 3 = 30p.", "5 × 30p = 150p."], a: "£1.50" },
          { q: "A car travels 120 km in 2 hours at a steady speed. How far in 5 hours?", s: ["Speed = 120 ÷ 2 = 60 km/h.", "5 × 60 = 300."], a: "300 km" },
        ],
      },
      {
        id: "ratio-scale",
        title: "Scale & Maps",
        keyPoints: [
          "Maps use scale ratios like 1:50,000 — 1 unit on the map is 50,000 on the ground.",
          "To go from a scaled drawing to real size, multiply by the scale factor.",
          "To go from real size to a drawing, divide by the scale factor.",
        ],
        examples: [
          { q: "A map uses scale 1:10,000. Two towns are 4 cm apart. Real distance?", s: ["4 × 10,000 = 40,000 cm.", "40,000 cm = 400 m."], a: "400 m" },
          { q: "A model is 1:24 scale. The real car is 4.8 m. How long is the model?", s: ["4.8 ÷ 24 = 0.2 m.", "0.2 m = 20 cm."], a: "20 cm" },
        ],
      },
    ],
  },
  {
    id: "algebra",
    title: "Algebra",
    emoji: "❎",
    color: "#a29bfe",
    blurb: "Using letters for unknown numbers.",
    lessons: [
      {
        id: "algebra-intro",
        title: "Using Letters for Numbers",
        keyPoints: [
          "Algebra uses letters like x and y to stand for unknown numbers.",
          "3x means 3 × x. If x = 4, then 3x = 12.",
          "Like terms can be combined: 3x + 2x = 5x, but 3x + 2 cannot be simplified.",
        ],
        examples: [
          { q: "If x = 5, what is 4x + 3?", s: ["4 × 5 = 20.", "20 + 3 = 23."], a: "23" },
          { q: "Simplify 2x + 3x + 4.", s: ["2x + 3x = 5x.", "Plus the 4 (not a like term)."], a: "5x + 4" },
        ],
      },
      {
        id: "algebra-equations",
        title: "Solving Equations",
        keyPoints: [
          "An equation says two things are equal: x + 5 = 12.",
          "Do the same thing to both sides to keep it balanced.",
          "Get x alone: x + 5 = 12 → x = 12 − 5 = 7.",
        ],
        examples: [
          { q: "Solve x + 7 = 15.", s: ["Subtract 7 from both sides.", "x = 15 − 7."], a: "x = 8" },
          { q: "Solve 3x = 21.", s: ["Divide both sides by 3.", "x = 21 ÷ 3."], a: "x = 7" },
        ],
      },
      {
        id: "algebra-sequences",
        title: "Number Sequences",
        keyPoints: [
          "A sequence follows a rule. In 3, 6, 9, 12... each term goes up by 3.",
          "The rule can be written as 'nth term': for +3 each time starting at 3, it's 3n.",
          "Sequences are how we spot and describe patterns.",
        ],
        examples: [
          { q: "Find the next term: 5, 10, 15, 20, ?", s: ["Each term adds 5.", "20 + 5 = 25."], a: "25" },
          { q: "Find the 5th term of the sequence that goes 2, 4, 6, 8...", s: ["Pattern: +2 each time.", "8, 10, 12, 14, 16... the 5th term is 10."], a: "10" },
        ],
      },
    ],
  },
  {
    id: "geometry",
    title: "Geometry",
    emoji: "📐",
    color: "#00b894",
    blurb: "Shapes, angles, area and perimeter.",
    lessons: [
      {
        id: "geo-shapes",
        title: "2D Shapes & Angles",
        keyPoints: [
          "Triangles have 3 sides and angles that add to 180°.",
          "Quadrilaterals (squares, rectangles, etc.) have angles adding to 360°.",
          "An acute angle is under 90°, a right angle is 90°, an obtuse angle is between 90° and 180°.",
        ],
        examples: [
          { q: "Two angles of a triangle are 40° and 60°. What's the third?", s: ["Angles add to 180°.", "180 − 40 − 60 = 80."], a: "80°" },
          { q: "A rectangle has one angle of 90°. What are the others?", s: ["All angles in a rectangle are 90°."], a: "90° each" },
        ],
      },
      {
        id: "geo-area",
        title: "Area & Perimeter",
        keyPoints: [
          "Perimeter is the distance around a shape: add up all the sides.",
          "Area of a rectangle = length × width.",
          "Area of a triangle = ½ × base × height.",
        ],
        examples: [
          { q: "Find the perimeter of a rectangle 8 cm by 3 cm.", s: ["Perimeter = 8 + 3 + 8 + 3.", "= 22."], a: "22 cm" },
          { q: "Find the area of a triangle with base 10 m and height 6 m.", s: ["Area = ½ × 10 × 6.", "= 30."], a: "30 m²" },
        ],
      },
      {
        id: "geo-coords",
        title: "Coordinates",
        keyPoints: [
          "Coordinates (x, y) describe a point on a grid.",
          "Move along the x-axis first (right), then the y-axis (up).",
          "The origin is (0, 0), where the two axes meet.",
        ],
        examples: [
          { q: "Starting at (0,0), move 3 right and 2 up. Where are you?", s: ["x = 3, y = 2.", "Write it as (x, y)."], a: "(3, 2)" },
          { q: "Which is correct for a point 5 up and 4 left of the origin?", s: ["Left means negative x.", "x = −4, y = 5."], a: "(−4, 5)" },
        ],
      },
    ],
  },
  {
    id: "measurement",
    title: "Measurement",
    emoji: "📏",
    color: "#fdcb6e",
    blurb: "Length, mass, capacity, time and money.",
    lessons: [
      {
        id: "meas-units",
        title: "Metric Units",
        keyPoints: [
          "The metric system uses 10s, so converting is multiplying or dividing by powers of 10.",
          "1 km = 1000 m, 1 m = 100 cm, 1 cm = 10 mm.",
          "1 kg = 1000 g, 1 L = 1000 mL.",
        ],
        examples: [
          { q: "Convert 3.5 km to metres.", s: ["1 km = 1000 m.", "3.5 × 1000 = 3500."], a: "3500 m" },
          { q: "Convert 250 cm to metres.", s: ["100 cm = 1 m.", "250 ÷ 100 = 2.5."], a: "2.5 m" },
        ],
      },
      {
        id: "meas-time",
        title: "Time & Duration",
        keyPoints: [
          "1 hour = 60 minutes, 1 minute = 60 seconds.",
          "To find a duration, subtract the start time from the end time.",
          "Break the problem into hours then minutes to make it easier.",
        ],
        examples: [
          { q: "A film starts at 14:15 and ends at 15:50. How long is it?", s: ["15:50 − 14:15.", "1 hour and 35 minutes."], a: "1h 35m" },
          { q: "How many minutes in 3 hours?", s: ["3 × 60 = 180."], a: "180 minutes" },
        ],
      },
      {
        id: "meas-money",
        title: "Money & Change",
        keyPoints: [
          "Add coins and notes by grouping into the biggest units first.",
          "Change = money given − cost.",
          "Round to the nearest pence/cents when money has extra digits.",
        ],
        examples: [
          { q: "An item costs £6.75 and you pay with £10. What change?", s: ["10.00 − 6.75 = 3.25."], a: "£3.25" },
          { q: "You buy 3 items at £1.20 each. Total cost?", s: ["3 × 1.20 = 3.60."], a: "£3.60" },
        ],
      },
    ],
  },
  {
    id: "stats",
    title: "Statistics & Probability",
    emoji: "📊",
    color: "#00b894",
    blurb: "Data, averages and the chance of things happening.",
    lessons: [
      {
        id: "stats-average",
        title: "Mean, Median, Mode & Range",
        keyPoints: [
          "Mean = add all values, then divide by how many there are.",
          "Median = the middle value after sorting.",
          "Mode = the most common value. Range = biggest − smallest.",
        ],
        examples: [
          { q: "Find the mean of 4, 6, 8, 10.", s: ["Sum = 28, four values.", "28 ÷ 4 = 7."], a: "7" },
          { q: "Scores: 3, 7, 3, 9. Find the mode and range.", s: ["Mode = 3 (appears twice).", "Range = 9 − 3 = 6."], a: "mode 3, range 6" },
        ],
      },
      {
        id: "stats-graphs",
        title: "Reading Graphs",
        keyPoints: [
          "Bar charts compare categories — the taller the bar, the bigger the value.",
          "Line graphs show change over time.",
          "Pie charts show parts of a whole; the whole circle is 100%.",
        ],
        examples: [
          { q: "A bar chart shows 4 days of rainfall: 2mm, 5mm, 3mm, 0mm. Which day had the most?", s: ["The tallest bar is 5mm."], a: "day 2" },
          { q: "A pie chart is split 50% / 25% / 25%. What fraction is the 25% slice?", s: ["25% = 25/100 = 1/4."], a: "1/4" },
        ],
      },
      {
        id: "stats-probability",
        title: "Probability",
        keyPoints: [
          "Probability measures how likely something is, from 0 (impossible) to 1 (certain).",
          "Probability = favourable outcomes ÷ total outcomes.",
          "The probabilities of all outcomes add up to 1.",
        ],
        examples: [
          { q: "Roll a fair 6-sided die. Probability of rolling a 4?", s: ["1 favourable outcome, 6 total.", "1 ÷ 6."], a: "1/6" },
          { q: "A bag has 3 red and 2 blue balls. Probability of picking red?", s: ["3 red out of 5 balls.", "3 ÷ 5."], a: "3/5" },
        ],
      },
    ],
  },
  {
    id: "geometry-adv",
    title: "Geometry",
    emoji: "📐",
    color: "#16a085",
    blurb: "Angles, polygons, circle theorems and 3D solids.",
    lessons: [
      {
        id: "geo-adv-angles",
        title: "Angles & Polygons",
        keyPoints: [
          "Angles on a straight line add to 180°. Angles around a point add to 360°. Vertically opposite angles are equal.",
          "Parallel lines: alternate angles are equal, co-interior angles add to 180°, corresponding angles are equal.",
          "Interior angles of an n-sided polygon add to (n − 2) × 180°. Each interior angle of a regular n-gon is (n−2)×180° ÷ n.",
        ],
        examples: [
          { q: "Two parallel lines cut by a transversal make a 55° alternate angle. Find its alternate pair.", s: ["Alternate angles are equal.", "So the other angle is also 55°."], a: "55°" },
          { q: "Find the sum of interior angles of a hexagon.", s: ["Sum = (n − 2) × 180°.", "(6 − 2) × 180° = 720°."], a: "720°" },
        ],
      },
      {
        id: "geo-adv-circles",
        title: "Circle Theorems",
        keyPoints: [
          "The angle at the centre is twice the angle at the circumference standing on the same arc.",
          "Angles in the same segment are equal. The angle in a semicircle is always 90°.",
          "A tangent is perpendicular to the radius at the point of contact. Tangents from one external point are equal in length.",
        ],
        examples: [
          { q: "The angle at the centre is 80°. What is the angle at the circumference on the same arc?", s: ["Centre = 2 × circumference.", "80° ÷ 2 = 40°."], a: "40°" },
          { q: "A triangle drawn in a semicircle has hypotenuse 10 cm as diameter. One angle at the circumference is?", s: ["Angle in a semicircle is a right angle.", "So it is 90°."], a: "90°" },
        ],
      },
      {
        id: "geo-adv-solids",
        title: "Area, Pythagoras & Solids",
        keyPoints: [
          "Pythagoras: a² + b² = c² for a right-angled triangle, where c is the hypotenuse.",
          "Area of trapezium = ½ × (a + b) × h. Circumference = 2πr, area of circle = πr².",
          "Volume of prism = area of cross-section × length. Volume of cylinder = πr²h.",
        ],
        examples: [
          { q: "Right triangle legs 3 cm and 4 cm. Find the hypotenuse.", s: ["c² = 3² + 4² = 9 + 16 = 25.", "c = √25 = 5."], a: "5 cm" },
          { q: "Find the area of a circle with radius 7 cm (use π = 22/7).", s: ["Area = πr² = 22/7 × 49.", "= 22 × 7 = 154."], a: "154 cm²" },
        ],
      },
    ],
  },
  {
    id: "trig",
    title: "Trigonometry",
    emoji: "📏",
    color: "#e17055",
    blurb: "Right-angled triangles: sin, cos, tan and real-life angles.",
    lessons: [
      {
        id: "trig-basics",
        title: "SOH CAH TOA",
        keyPoints: [
          "sin θ = opposite ÷ hypotenuse, cos θ = adjacent ÷ hypotenuse, tan θ = opposite ÷ adjacent.",
          "Label sides relative to the angle θ: opposite is across from θ, adjacent is next to θ (not the hypotenuse).",
          "Use the diagram: for a 3-4-5 triangle with θ opposite side 3, sin θ = 3/5, cos θ = 4/5, tan θ = 3/4.",
        ],
        examples: [
          { q: "In a right triangle, opposite = 3 and hypotenuse = 5. Find sin θ.", s: ["sin θ = opposite ÷ hypotenuse.", "sin θ = 3/5."], a: "3/5" },
          { q: "Adjacent = 4, hypotenuse = 5. Find cos θ.", s: ["cos θ = adjacent ÷ hypotenuse.", "cos θ = 4/5."], a: "4/5" },
        ],
      },
      {
        id: "trig-solving",
        title: "Finding Sides & Angles",
        keyPoints: [
          "To find a missing side: cover it in SOH CAH TOA, then multiply or divide. E.g. opposite = hypotenuse × sin θ.",
          "To find a missing angle: use inverse trig, e.g. θ = sin⁻¹(opposite ÷ hypotenuse).",
          "Always check: hypotenuse is the longest side, and angles add to 180°.",
        ],
        examples: [
          { q: "Hypotenuse = 10, θ = 30°. Find the opposite side.", s: ["opposite = 10 × sin 30°.", "sin 30° = 0.5, so opposite = 5."], a: "5" },
          { q: "Opposite = 5, hypotenuse = 10. Find θ.", s: ["sin θ = 5/10 = 0.5.", "θ = sin⁻¹(0.5) = 30°."], a: "30°" },
        ],
      },
      {
        id: "trig-exact",
        title: "Exact Values & Elevation",
        keyPoints: [
          "Memorise: sin 30° = 1/2, sin 45° = √2/2, sin 60° = √3/2; cos mirrors them; tan 30° = 1/√3, tan 45° = 1, tan 60° = √3.",
          "Angle of elevation = looking up from horizontal. Angle of depression = looking down from horizontal.",
          "Draw the right triangle first, label the known side and angle, then pick SOH CAH TOA.",
        ],
        examples: [
          { q: "Find tan 45°.", s: ["tan 45° = opposite ÷ adjacent for an isosceles right triangle.", "Both legs equal, so tan = 1."], a: "1" },
          { q: "A ladder leans so the angle of elevation is 60°. The adjacent ground side is 2 m. Find the ladder length (hypotenuse).", s: ["cos 60° = adjacent ÷ hypotenuse = 1/2.", "hypotenuse = 2 ÷ 0.5 = 4."], a: "4 m" },
        ],
      },
    ],
  },
  {
    id: "coord1",
    title: "Coordinate Geometry",
    emoji: "📍",
    color: "#0984e3",
    blurb: "The coordinate plane: distance, midpoint, slope and lines.",
    lessons: [
      {
        id: "coord-distance",
        title: "The Plane & Distance",
        keyPoints: [
          "Points are (x, y): x runs left–right, y runs bottom–top. The origin (0,0) is where axes cross.",
          "Distance between A(x₁,y₁) and B(x₂,y₂) is √[(x₂−x₁)² + (y₂−y₁)²] — Pythagoras on the plane.",
          "See the diagram: the segment AB is the hypotenuse of a right triangle with legs |Δx| and |Δy|.",
        ],
        examples: [
          { q: "Find the distance between (0, 0) and (3, 4).", s: ["Δx = 3, Δy = 4.", "distance = √(9 + 16) = √25 = 5."], a: "5" },
          { q: "Points A(1, 2) and B(4, 6) are plotted. Find AB.", s: ["Δx = 3, Δy = 4.", "AB = √(9+16) = 5."], a: "5" },
        ],
      },
      {
        id: "coord-mid-slope",
        title: "Midpoint & Slope",
        keyPoints: [
          "Midpoint M = ((x₁+x₂)/2, (y₁+y₂)/2) — average the x's and average the y's.",
          "Slope (gradient) m = (y₂−y₁) ÷ (x₂−x₁) = rise ÷ run. Positive slopes go uphill left-to-right.",
          "Parallel lines share the same slope. Perpendicular slopes multiply to −1.",
        ],
        examples: [
          { q: "Find the midpoint of (2, 4) and (6, 10).", s: ["x: (2+6)/2 = 4.", "y: (4+10)/2 = 7."], a: "(4, 7)" },
          { q: "Find the slope between (1, 2) and (5, 10).", s: ["rise = 8, run = 4.", "m = 8 ÷ 4 = 2."], a: "2" },
        ],
      },
      {
        id: "coord-line",
        title: "Equation of a Line",
        keyPoints: [
          "Slope-intercept form: y = mx + c, where m is slope and c is the y-intercept (where x = 0).",
          "To find the equation: first find m from two points, then substitute one point to solve for c.",
          "Horizontal lines are y = constant (m = 0). Vertical lines are x = constant (undefined slope).",
        ],
        examples: [
          { q: "Line has slope 2 and passes through (0, 3). Write its equation.", s: ["y = mx + c with m = 2, c = 3.", "y = 2x + 3."], a: "y = 2x + 3" },
          { q: "Find the y-intercept of y = 3x − 5.", s: ["Compare with y = mx + c.", "c = −5."], a: "-5" },
        ],
      },
    ],
  },
  {
    id: "stats2",
    title: "Statistics",
    emoji: "📊",
    color: "#8e44ad",
    blurb: "Summarise data: centres, spread and charts.",
    lessons: [
      {
        id: "stats-central",
        title: "Averages Revisited",
        keyPoints: [
          "Mean is sensitive to outliers; median (middle after sorting) resists them.",
          "For grouped data, estimate the mean with midpoints: Σ(f × midpoint) ÷ Σf.",
          "Mode = most frequent class or value. Choose median for skewed pay/house-price data.",
        ],
        examples: [
          { q: "Data: 2, 3, 3, 5, 20. Which is better: mean or median?", s: ["Mean = 33/5 = 6.6, pulled up by 20.", "Median = 3, more typical."], a: "median (3)" },
          { q: "Estimate the mean: values 10 (×2) and 20 (×3).", s: ["Σfx = 20 + 60 = 80, Σf = 5.", "80 ÷ 5 = 16."], a: "16" },
        ],
      },
      {
        id: "stats-spread",
        title: "Range, Variance & SD",
        keyPoints: [
          "Range = max − min (quick spread). Interquartile range IQR = Q3 − Q1 (middle 50% spread).",
          "Variance = average of squared differences from the mean. Standard deviation = √variance.",
          "Small SD means data clusters near the mean; large SD means it spreads out.",
        ],
        examples: [
          { q: "Data 4, 8, 6, 10. Find the range.", s: ["max = 10, min = 4.", "10 − 4 = 6."], a: "6" },
          { q: "Data 2, 4, 4, 4, 5, 5, 7, 9 has mean 5 and variance 4. Find the SD.", s: ["SD = √variance.", "√4 = 2."], a: "2" },
        ],
      },
      {
        id: "stats-charts",
        title: "Histograms & Box Plots",
        keyPoints: [
          "Histograms show frequency over continuous intervals; bar area (not just height) matters when widths differ.",
          "A box plot shows min, Q1, median, Q3, max — the box holds the middle 50%.",
          "Cumulative frequency graphs let you read off medians and quartiles by going up to the curve then across.",
        ],
        examples: [
          { q: "A box plot has Q1 = 10 and Q3 = 22. Find the IQR.", s: ["IQR = Q3 − Q1.", "22 − 10 = 12."], a: "12" },
          { q: "A histogram bar covers 0–10 with frequency 20. What is the frequency density?", s: ["density = frequency ÷ width.", "20 ÷ 10 = 2."], a: "2" },
        ],
      },
    ],
  },
  {
    id: "trig2",
    title: "Trigonometry 2",
    emoji: "🔺",
    color: "#d35400",
    blurb: "Identities, compound & double angles, inverse trig.",
    lessons: [
      {
        id: "trig2-compound",
        title: "Compound Angles",
        keyPoints: [
          "sin(A ± B) = sin A cos B ± cos A sin B. cos(A ± B) = cos A cos B ∓ sin A sin B.",
          "tan(A ± B) = (tan A ± tan B) ÷ (1 ∓ tan A tan B). Watch the sign flip for cos and the denominator.",
          "Use these to find exact values, e.g. sin 75° = sin(45° + 30°).",
        ],
        examples: [
          { q: "Expand sin(A + B).", s: ["sin(A+B) = sin A cos B + cos A sin B."], a: "sin A cos B + cos A sin B" },
          { q: "Write cos 75° using 45° and 30°.", s: ["75° = 45° + 30°.", "cos75° = cos45°cos30° − sin45°sin30°."], a: "cos45°cos30° − sin45°sin30°" },
        ],
      },
      {
        id: "trig2-double",
        title: "Double-Angle & Products",
        keyPoints: [
          "sin 2A = 2 sin A cos A. cos 2A = cos²A − sin²A = 2cos²A − 1 = 1 − 2sin²A. tan 2A = 2tan A ÷ (1 − tan²A).",
          "Product-to-sum: sin X cos Y = ½[sin(X+Y) + sin(X−Y)]. Sum-to-product: sin P + sin Q = 2 sin((P+Q)/2) cos((P−Q)/2).",
          "Pythagorean identity: sin²θ + cos²θ = 1. Also 1 + tan²θ = sec²θ.",
        ],
        examples: [
          { q: "If sin A = 3/5, find sin 2A given cos A = 4/5.", s: ["sin 2A = 2 sin A cos A.", "2 × 3/5 × 4/5 = 24/25."], a: "24/25" },
          { q: "Simplify sin²θ + cos²θ.", s: ["Pythagorean identity.", "Always equals 1."], a: "1" },
        ],
      },
      {
        id: "trig2-inverse",
        title: "Inverse Trig & Equations",
        keyPoints: [
          "Inverse trig undoes trig: if sin θ = x then θ = sin⁻¹x. Principal ranges: sin⁻¹ → [−90°, 90°], cos⁻¹ → [0°, 180°], tan⁻¹ → (−90°, 90°).",
          "Trig equations have many solutions: e.g. sin θ = 1/2 gives θ = 30°, 150°, 390°, … Use CAST / the unit circle.",
          "For 0° ≤ θ < 360°, solve by finding the reference angle then placing it in the correct quadrants.",
        ],
        examples: [
          { q: "Find sin⁻¹(1/2) in [0°, 90°].", s: ["sin 30° = 1/2.", "So sin⁻¹(1/2) = 30°."], a: "30°" },
          { q: "Solve sin θ = 1/2 for 0° ≤ θ < 360°.", s: ["Reference angle 30°.", "sin positive in Q1 and Q2: 30°, 150°."], a: "30°, 150°" },
        ],
      },
    ],
  },
  {
    id: "coord2",
    title: "Coordinate Geometry 2 – Circles",
    emoji: "⭕",
    color: "#0097e6",
    blurb: "Circles on the plane: equations, tangents and chords.",
    lessons: [
      {
        id: "circle-eq",
        title: "Equation of a Circle",
        keyPoints: [
          "Centre (h, k), radius r: (x − h)² + (y − k)² = r². Centre at origin: x² + y² = r².",
          "General form: x² + y² + 2gx + 2fy + c = 0 has centre (−g, −f) and radius √(g² + f² − c).",
          "Complete the square to go from general form to centre–radius form. The diagram shows centre and radius on the plane.",
        ],
        examples: [
          { q: "Write the equation of a circle with centre (0, 0) and radius 5.", s: ["x² + y² = r².", "x² + y² = 25."], a: "x² + y² = 25" },
          { q: "Centre (2, −1), radius 3. Write the equation.", s: ["(x − 2)² + (y + 1)² = 9."], a: "(x − 2)² + (y + 1)² = 9" },
        ],
      },
      {
        id: "circle-tangent",
        title: "Tangents & Chords",
        keyPoints: [
          "Radius to a tangent is perpendicular: slope(radius) × slope(tangent) = −1.",
          "Equation of tangent at (x₁, y₁) on x² + y² = r² is xx₁ + yy₁ = r².",
          "The perpendicular from the centre bisects any chord.",
        ],
        examples: [
          { q: "Circle x² + y² = 25. Find the tangent at (3, 4).", s: ["Use xx₁ + yy₁ = r².", "3x + 4y = 25."], a: "3x + 4y = 25" },
          { q: "Radius to point (3, 4) has slope 4/3. What is the tangent's slope?", s: ["Perpendicular: m = −1 ÷ (4/3).", "m = −3/4."], a: "-3/4" },
        ],
      },
      {
        id: "circle-pos",
        title: "Points, Lines & Circles",
        keyPoints: [
          "Plug a point into the left side: < r² means inside, = r² means on, > r² means outside the circle.",
          "A line meets a circle in 0, 1 (tangent) or 2 (secant) points — substitute y = mx + c and check the discriminant.",
          "Distance from centre to line < r means the line cuts the circle twice.",
        ],
        examples: [
          { q: "Is (1, 1) inside x² + y² = 25?", s: ["1 + 1 = 2 < 25.", "Yes, inside."], a: "inside" },
          { q: "How many times does a tangent touch a circle?", s: ["Exactly once.", "Discriminant = 0."], a: "once" },
        ],
      },
    ],
  },
  {
    id: "prob2",
    title: "Probability",
    emoji: "🎲",
    color: "#e84393",
    blurb: "Rules, trees, conditional chance and expected value.",
    lessons: [
      {
        id: "prob-rules",
        title: "Addition & Multiplication",
        keyPoints: [
          "Complement: P(not A) = 1 − P(A). Mutually exclusive: P(A or B) = P(A) + P(B).",
          "General addition: P(A or B) = P(A) + P(B) − P(A and B).",
          "Independent events: P(A and B) = P(A) × P(B). With replacement = independent; without = dependent.",
        ],
        examples: [
          { q: "P(rain) = 0.3. Find P(no rain).", s: ["1 − 0.3 = 0.7."], a: "0.7" },
          { q: "Flip two fair coins. P(both heads)?", s: ["1/2 × 1/2 = 1/4."], a: "1/4" },
        ],
      },
      {
        id: "prob-conditional",
        title: "Conditional & Trees",
        keyPoints: [
          "Conditional: P(A|B) = P(A and B) ÷ P(B) — 'given B happened'.",
          "Tree diagrams: multiply along branches, add across mutually exclusive paths.",
          "Without replacement, denominators shrink: e.g. 5/8 then 4/7.",
        ],
        examples: [
          { q: "Bag: 3 red, 2 blue. Pick two without replacement. P(both red)?", s: ["3/5 × 2/4 = 6/20.", "= 3/10."], a: "3/10" },
          { q: "P(A and B) = 0.2, P(B) = 0.5. Find P(A|B).", s: ["0.2 ÷ 0.5 = 0.4."], a: "0.4" },
        ],
      },
      {
        id: "prob-expected",
        title: "Expected Value & Binomial",
        keyPoints: [
          "Expected value E = Σ(x × P(x)) — the long-run average per trial.",
          "Binomial: n fixed trials, two outcomes, constant p. P(k wins) = C(n,k) pᵏ (1−p)ⁿ⁻ᵏ.",
          "Expected wins in binomial = n × p.",
        ],
        examples: [
          { q: "Game pays £10 with probability 0.2 else £0. Find expected value.", s: ["10 × 0.2 + 0 × 0.8 = 2."], a: "£2" },
          { q: "Shoot 10 free throws with p = 0.8. Expected makes?", s: ["n × p = 10 × 0.8.", "= 8."], a: "8" },
        ],
      },
    ],
  },
  {
    id: "seq",
    title: "Sequences & Series",
    emoji: "🔢",
    color: "#e67e22",
    blurb: "Arithmetic, geometric and special number patterns.",
    lessons: [
      {
        id: "seq-arithmetic",
        title: "Arithmetic Sequences",
        keyPoints: [
          "Arithmetic (AP): add fixed d each time. nth term: aₙ = a + (n − 1)d.",
          "Sum of first n terms: Sₙ = n/2 × [2a + (n−1)d] = n/2 × (first + last).",
          "Check d by subtracting neighbours: 5, 9, 13… has d = 4.",
        ],
        examples: [
          { q: "AP: 3, 7, 11, … Find the 10th term.", s: ["a = 3, d = 4.", "a₁₀ = 3 + 9×4 = 39."], a: "39" },
          { q: "Sum 1 + 2 + … + 100.", s: ["S = 100/2 × (1 + 100).", "= 50 × 101 = 5050."], a: "5050" },
        ],
      },
      {
        id: "seq-geometric",
        title: "Geometric Sequences",
        keyPoints: [
          "Geometric (GP): multiply by fixed r each time. nth term: aₙ = a·rⁿ⁻¹.",
          "Finite sum: Sₙ = a(rⁿ − 1)/(r − 1) for r ≠ 1. Infinite sum (|r| < 1): S∞ = a/(1 − r).",
          "If |r| ≥ 1 the infinite sum diverges (grows forever).",
        ],
        examples: [
          { q: "GP: 2, 6, 18, … Find the 5th term.", s: ["a = 2, r = 3.", "a₅ = 2 × 3⁴ = 162."], a: "162" },
          { q: "Find 1 + 1/2 + 1/4 + … to infinity.", s: ["a = 1, r = 1/2.", "S∞ = 1/(1 − 1/2) = 2."], a: "2" },
        ],
      },
      {
        id: "seq-special",
        title: "Special Sequences",
        keyPoints: [
          "Quadratic sequences have constant second difference 2a; nth term is an² + bn + c.",
          "Triangular numbers: 1, 3, 6, 10… with Tₙ = n(n+1)/2. Fibonacci: add previous two (1, 1, 2, 3, 5…).",
          "Sigma Σ means 'sum': Σₖ₌₁ⁿ k = n(n+1)/2.",
        ],
        examples: [
          { q: "Find the next Fibonacci number after 1, 1, 2, 3, 5, 8.", s: ["Add last two: 5 + 8.", "= 13."], a: "13" },
          { q: "Find the 5th triangular number.", s: ["T₅ = 5×6/2.", "= 15."], a: "15" },
        ],
      },
    ],
  },
  {
    id: "calc-int",
    title: "Integration Calculus",
    emoji: "∫",
    color: "#27ae60",
    blurb: "Antidifferentiation, definite integrals and areas.",
    lessons: [
      {
        id: "int-basics",
        title: "Indefinite Integrals",
        keyPoints: [
          "Integration undoes differentiation. ∫xⁿ dx = xⁿ⁺¹/(n+1) + C for n ≠ −1.",
          "Constant of integration +C because derivatives kill constants — always include it for indefinite integrals.",
          "Check by differentiating your answer: d/dx [x³/3 + C] = x².",
        ],
        examples: [
          { q: "Find ∫x² dx.", s: ["Power rule: (2+1) = 3.", "x³/3 + C."], a: "x³/3 + C" },
          { q: "Find ∫3x dx.", s: ["3 × x²/2 + C.", "= 3x²/2 + C."], a: "3x²/2 + C" },
        ],
      },
      {
        id: "int-definite",
        title: "Definite Integrals & Area",
        keyPoints: [
          "Definite integral ∫ₐᵇ f(x)dx = F(b) − F(a), where F is any antiderivative. The +C cancels out.",
          "It gives signed area: area above the x-axis counts +, below counts −.",
          "Example: ∫₀² x² dx = [x³/3]₀² = 8/3.",
        ],
        examples: [
          { q: "Evaluate ∫₀¹ x dx.", s: ["Antiderivative x²/2.", "1/2 − 0 = 1/2."], a: "1/2" },
          { q: "Evaluate ∫₀² 3 dx.", s: ["Antiderivative 3x.", "6 − 0 = 6."], a: "6" },
        ],
      },
      {
        id: "int-apply",
        title: "Areas & Motion",
        keyPoints: [
          "Area between curve and x-axis from a to b: ∫ₐᵇ |f(x)| dx (split where f crosses zero).",
          "Area between two curves: ∫ₐᵇ (top − bottom) dx.",
          "Motion: displacement = ∫v dt, velocity = ∫a dt. Given v = 3t², displacement from 0 to 2 is [t³]₀² = 8.",
        ],
        examples: [
          { q: "Find the area under y = x from 0 to 4.", s: ["∫₀⁴ x dx = [x²/2]₀⁴.", "= 16/2 = 8."], a: "8" },
          { q: "Velocity v = 2t. Find displacement from t = 0 to 3.", s: ["∫₀³ 2t dt = [t²]₀³.", "= 9."], a: "9" },
        ],
      },
    ],
  },
];

export function totalLessons(): number {
  return CHAPTERS.reduce((n, c) => n + c.lessons.length, 0);
}

export function getChapter(id: string): Chapter | undefined {
  return CHAPTERS.find((c) => c.id === id);
}

export function getLesson(chapterId: string, lessonId: string): Lesson | undefined {
  return getChapter(chapterId)?.lessons.find((l) => l.id === lessonId);
}