import pandas as pd
from collections import Counter

def analyze_media_types():
    """Analyze the distribution of all 139 media outlets by their primary media type"""
    
    # Load the geocoded outlets data
    df = pd.read_csv('NM_NEWS_OUTLETS_GEOCODED_2025_FIXED.csv')
    
    print(f"Total outlets in dataset: {len(df)}")
    
    # Get the distribution of primary media types
    media_type_counts = df['PRIMARY_MEDIA'].value_counts()
    
    print("\n=== MEDIA OUTLET DISTRIBUTION BY PRIMARY MEDIA TYPE ===")
    print(f"{'Media Type':<15} {'Count':<8} {'Percentage':<12}")
    print("-" * 40)
    
    total_outlets = len(df)
    for media_type, count in media_type_counts.items():
        percentage = (count / total_outlets) * 100
        print(f"{media_type:<15} {count:<8} {percentage:>8.1f}%")
    
    print("-" * 40)
    print(f"{'TOTAL':<15} {total_outlets:<8} {'100.0%':>8}")
    
    # Create a summary table as DataFrame for easier viewing
    summary_df = pd.DataFrame({
        'Media_Type': media_type_counts.index,
        'Count': media_type_counts.values,
        'Percentage': (media_type_counts.values / total_outlets * 100).round(1)
    })
    
    print("\n=== SUMMARY TABLE ===")
    print(summary_df.to_string(index=False))
    
    # Show some examples of each media type
    print("\n=== EXAMPLES BY MEDIA TYPE ===")
    for media_type in media_type_counts.index:
        examples = df[df['PRIMARY_MEDIA'] == media_type]['OUTLET_NAME'].head(3).tolist()
        print(f"{media_type}: {', '.join(examples)}")
    
    return summary_df

if __name__ == "__main__":
    summary = analyze_media_types()
