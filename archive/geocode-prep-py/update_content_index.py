import pandas as pd
import numpy as np

def update_content_index_format():
    """Update the NEWS_CONTENT_INDEX column to show values as fractions over 3.00"""
    
    # Load the CSV file
    df = pd.read_csv('NM_NEWS_OUTLETS_GEOCODED_2025_FIXED.csv')
    
    print(f"Loaded {len(df)} outlets")
    print(f"Original NEWS_CONTENT_INDEX column type: {df['NEWS_CONTENT_INDEX'].dtype}")
    
    # Show some original values
    print("\nOriginal NEWS_CONTENT_INDEX values (first 10):")
    print(df['NEWS_CONTENT_INDEX'].head(10).tolist())
    
    # Create new formatted column
    def format_content_index(value):
        if pd.isna(value) or value == '*':
            return value  # Keep missing/asterisk values as-is
        try:
            # Convert to float and format as fraction over 3.00
            float_val = float(value)
            return f"{float_val:.2f}/3.00"
        except (ValueError, TypeError):
            return value  # Keep original if can't convert
    
    # Apply the formatting
    df['NEWS_CONTENT_INDEX_FORMATTED'] = df['NEWS_CONTENT_INDEX'].apply(format_content_index)
    
    # Replace the original column with the formatted version
    df['NEWS_CONTENT_INDEX'] = df['NEWS_CONTENT_INDEX_FORMATTED']
    df = df.drop('NEWS_CONTENT_INDEX_FORMATTED', axis=1)
    
    # Show some updated values
    print("\nUpdated NEWS_CONTENT_INDEX values (first 10):")
    print(df['NEWS_CONTENT_INDEX'].head(10).tolist())
    
    # Count how many values were updated
    formatted_count = df['NEWS_CONTENT_INDEX'].str.contains('/3.00', na=False).sum()
    print(f"\nFormatted {formatted_count} content index values")
    
    # Save the updated file
    output_filename = 'NM_NEWS_OUTLETS_GEOCODED_2025_FIXED_UPDATED.csv'
    df.to_csv(output_filename, index=False)
    print(f"\nSaved updated file as: {output_filename}")
    
    # Show unique formatted values
    print("\nUnique formatted NEWS_CONTENT_INDEX values:")
    unique_values = df['NEWS_CONTENT_INDEX'].unique()
    for val in sorted(unique_values, key=lambda x: str(x)):
        count = (df['NEWS_CONTENT_INDEX'] == val).sum()
        print(f"  {val}: {count} outlets")
    
    return df

if __name__ == "__main__":
    updated_df = update_content_index_format()
