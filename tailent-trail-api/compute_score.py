"""
Semantic Similarity Score Computation Module
Uses BGEM3FlagModel for computing similarity between two texts
Returns similarity as percentage (0-100)
"""

from FlagEmbedding import BGEM3FlagModel

# Initialize BGEM3FlagModel once at module load
model = BGEM3FlagModel('BAAI/bge-m3', use_fp16=True)


def compute_similarity(text1, text2):
    """
    Compute semantic similarity between two text inputs using BGEM3 embeddings.
    
    Args:
        text1 (str): First text input
        text2 (str): Second text input
    
    Returns:
        float: Similarity score as percentage (0-100)
    
    Raises:
        ValueError: If either text is empty
    """
    if not text1 or not text2:
        raise ValueError("Both text1 and text2 parameters are required and cannot be empty")
    
    try:
        # Encode texts to obtain dense vectors
        embeddings_1 = model.encode(text1, batch_size=12, max_length=8192)['dense_vecs']
        embeddings_2 = model.encode(text2, batch_size=12, max_length=8192)['dense_vecs']
        
        # Compute similarity matrix
        similarity = embeddings_1 @ embeddings_2.T
        similarity_score = round(float(similarity) * 100, 2)
        
        return similarity_score
        
    except Exception as e:
        raise Exception(f"Error computing similarity: {str(e)}")


def get_model():
    """Return the initialized BGEM3 model"""
    return model
