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