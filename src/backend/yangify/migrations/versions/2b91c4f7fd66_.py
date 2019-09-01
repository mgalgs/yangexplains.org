"""empty message

Revision ID: 2b91c4f7fd66
Revises: 6e563ef88e63
Create Date: 2019-09-01 18:37:26.423242

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.ext.declarative import declarative_base


Base = declarative_base()


# revision identifiers, used by Alembic.
revision = '2b91c4f7fd66'
down_revision = '6e563ef88e63'
branch_labels = None
depends_on = None


# bare-bones subset of app.Explainer that we need for this migration
class Explainer(Base):
    __tablename__ = "explainer"

    id = sa.Column(sa.Integer, primary_key=True)
    views = sa.Column(sa.Integer, default=0)


def upgrade():
    bind = op.get_bind()
    session = sa.orm.Session(bind=bind)

    # set explainer slug based on question
    for explainer in session.query(Explainer):
        explainer.views = 0

    session.commit()


def downgrade():
    pass
