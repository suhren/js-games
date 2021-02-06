using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerMovement : MonoBehaviour
{

    public float moveSpeed;
    public float jumpSpeed;
    public Transform ceilingCheck;
    public Transform groundCheck;
    public LayerMask groundObjects;
    public float checkRadius;
    public int maxJumpCount;

    private Rigidbody2D rb;
    private bool facingRight = true;
    private float moveDirection;
    public bool isJumping = false;
    private bool isGrounded;
    private int jumpCount;

    // Awake is called after all objects are initialized. Called in a random order.
    void Awake()
    {
        // Will look for a component on this GameObject (what the script is arrached to) of type RigidBody2D
        rb = GetComponent<Rigidbody2D>();
    }

    // Start is called before the first frame update
    void Start()
    {
        jumpCount = maxJumpCount;   
    }

    // Update is called once per frame
    void Update()
    {
        // Get Inputs
        ProcessInputs();

        // Animate
        Animate();
    }

    // Better for handling Physics, can be called multiple times per update frame.
    private void FixedUpdate()
    {
        // Check if grounded
        isGrounded = Physics2D.OverlapCircle(groundCheck.position, checkRadius, groundObjects);

        if (isGrounded)
        {
            jumpCount = maxJumpCount;
        }
        // Move
        Move();
    }

    private void Move()
    {
        rb.velocity = new Vector2(moveDirection * moveSpeed, rb.velocity.y);

        if (isJumping)
        {
            rb.velocity = new Vector2(rb.velocity.x, jumpSpeed);
            jumpCount--;
        }
        isJumping = false;
    }

    private void Animate()
    {
        if (moveDirection > 0 && !facingRight)
        {
            FlipCharacter();
        }
        else if (moveDirection < 0 && facingRight)
        {
            FlipCharacter();
        }
    }

    private void ProcessInputs()
    {
        moveDirection = Input.GetAxis("Horizontal"); // Scale of -1 -> 1
        
        if (Input.GetButtonDown("Jump") && jumpCount > 0)
        {
            isJumping = true;
        }
    }

    private void FlipCharacter()
    {
        facingRight = !facingRight;
        transform.Rotate(0f, 180f, 0f);
    }
}
