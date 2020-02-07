using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Comments
{
    public class Create
    {
        public class Command : IRequest<CommentDto>
        {
            public string Body { get; set; }

            public Guid ActivityId { get; set; }

            public string Username { get; set; }
        }

        public class Handler : IRequestHandler<Command, CommentDto>
        {
            private readonly DataContext context;
            private readonly IMapper mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                this.mapper = mapper;
                this.context = context;
            }

            public async Task<CommentDto> Handle(Command request, CancellationToken cancellationToken)
            {
                var activity = await this.context.Activities.FindAsync(request.ActivityId);
                if (activity == null)
                    throw new RestException(HttpStatusCode.NotFound, new { Activity = "Not found." });
                
                var user = await this.context.Users.SingleOrDefaultAsync(u => u.UserName == request.Username);

                var comment = new Comment 
                {
                    Author = user,
                    Activity = activity,
                    Body = request.Body,
                    CreatedAt = DateTime.Now
                };
                activity.Comments.Add(comment);

                var success = await context.SaveChangesAsync() > 0; // SaveChangesAsync returns # of changes persisted to DB.
                if (success) return mapper.Map<CommentDto>(comment);

                throw new Exception("Problem saving activity");
            }
        }
    }
}